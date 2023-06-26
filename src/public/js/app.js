// io 함수는 알아서 socket.io를 실행하는 서버를 찾을 것
const socket = io();

//1. 유저로부터 비디오를 가져와서 화면에 보여줌
//2. 마이크를 음소거 및 음소거 해제하는 버튼 생성
//3. 핸드폰 전면 후면 카메라

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const chatBox = document.getElementById("chatBox");

const call = document.getElementById("call")

call.hidden = true
chatBox.hidden = true

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;
// Data Channel생성
let myDataChannel;


async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0]

    cameras.forEach(camera => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;

      // stream의 현재 카메라와 paint할 때의 카메라 option 가져오기
      if (currentCamera.lable === camera.lable) {
        option.selected = true
      }
      camerasSelect.appendChild(option)
    })
  } catch (error) {
    console.log(error);
  }
}

async function getMedia(deviceId) {

  const initialConstrains = {
    audio: true,
    video: { facingMode: "user" }
  }

  const cameraConstraints = {
    audio: true,
    video: {
      deviceId: {
        exact: deviceId
      }
    }
  }

  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstrains
    )

    myFace.srcObject = myStream;

    if (!deviceId) {
      getCameras()
    }

  } catch (error) {
    console.log(error);
  }
}

// console.log(myFace.srcObject)]



function handleMuteClick(e) {
  myStream.getAudioTracks().forEach(track => track.enabled
    = !track.enabled
  );

  if (!muted) {
    muteBtn.innerText = "Unmute"
    muted = true;

  } else {
    muteBtn.innerText = "Mute"
    muted = false;
  }
};



function handleCameraClick(e) {
  myStream.getVideoTracks().forEach(track => track.enabled
    = !track.enabled
  );

  if (cameraOff) {
    cameraBtn.innerText = "Turn Camera Off"
    cameraOff = false

  } else {
    cameraBtn.innerText = "Turn Camera On"
    cameraOff = true
  }
};

async function handleCameraChange() {
  await getMedia(camerasSelect.value)
  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0]
    const videoSender = myPeerConnection.getSenders().find((sender) => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack)
  }
}

muteBtn.addEventListener("click", handleMuteClick)
cameraBtn.addEventListener("click", handleCameraClick)
camerasSelect.addEventListener("input", handleCameraChange)




// welcome Form

const welcome = document.getElementById("welcome")
const welcomeForm = welcome.querySelector("form");


// webSocket들의 속도가 media를 가져오는 속도나 연결을 만드느 속도보다 빠름
// getMedia, makeConnection하고 이벤트를 emit할 것
async function initCall(params) {
  welcome.hidden = true;
  call.hidden = false;
  chatBox.hidden = false;
  // 1.getMedia
  await getMedia()
  // 2.makeConnection
  makeConnection()
}


async function handleWelcomeSubmit(e) {
  e.preventDefault()
  const input = welcomeForm.querySelector("input")
  await initCall()
  // 3. 이벤트를 emit
  roomName = input.value
  socket.emit("join_room",roomName,socket.id)
//  socket.emit("socket",socket.id,roomName)
  input.value = ""
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit)


// const chatBox = document.getElementById("chatBox")
const chatBoxForm = chatBox.querySelector("form");

function handleSubmitMessage (e){
  e.preventDefault()
  const input = chatBoxForm.querySelector("input")
  const ul = chatBox.querySelector("ul")
  const li = document.createElement("li")
  li.innerText="You: " + input.value
  ul.append(li)
  socket.emit("chat", roomName, input.value)
  input.value=""
}

chatBoxForm.addEventListener("submit",handleSubmitMessage)




//socket Code
socket.on("welcome", async () => {
  // 무언가를 offer하는 socket이 dataChannel을 생성하는 주체가 되어야 함, offer전에 data channel생성
  myDataChannel = myPeerConnection.createDataChannel("chat")
  myDataChannel.addEventListener("message", (event)=> {

    console.log(event.data)
  }
  )
console.log("made data channel");

//peer A에서 offer를 생성하여 서버로 전송
const offer = await myPeerConnection.createOffer();
myPeerConnection.setLocalDescription(offer)
console.log("sent the offer");
socket.emit("offer", offer, roomName)
})


//peer B는 offer를 받음
socket.on("offer", async (offer) => {
  myPeerConnection.addEventListener("datachannel", (event) => {
    myDataChannel = event.channel;
    myDataChannel.addEventListener("message", (event) => { console.log(event.data) })
  })
  console.log("receive the offer");
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer)
  socket.emit("answer", answer, roomName)
  console.log("sent the answer");
})

socket.on("answer", answer => {
  console.log("receive the answer");
  myPeerConnection.setRemoteDescription(answer)
})

socket.on("ice", (ice) => {
  console.log("receive candidate")
  myPeerConnection.addIceCandidate(ice)
})

socket.on("chat",(chat)=>{
  console.log(chat);
  const ul = chatBox.querySelector("ul")
  const li = document.createElement("li")
  li.innerText= "Anon: "+chat
  ul.append(li)
})

socket.on("room_full", () => {
  alert("방이 가득 찼습니다. 나중에 다시 시도해주세요.");
  window.location.reload()
});


//RTC code


// addStream대신 makeconnection이라는 함수를 사용, track들을 개별적으로 추가해주는 함수
function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    // webRTC를 사용한 실제 서비스나 전문적인 서비스를 만들고 싶다면 반드시 개인 소유의 stun을 구축해야함
    iceServers: [{
      urls: [
        // 구글에서 제공, 반드시 테스트용으로만 사용
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun3.l.google.com:19302",
        "stun:stun4.l.google.com:19302",
      ],
    }]
  });
  myPeerConnection.addEventListener("icecandidate", handleIce)
  myPeerConnection.addEventListener("addstream", handleAddStream)
  myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream))
}

function handleIce(data) {
  console.log("sent candidate")
  socket.emit("ice", data.candidate, roomName)
}

function handleAddStream(data) {
  const peersFace = document.getElementById("peersFace")
  // console.log("My Stream", myStream);
  peersFace.srcObject = data.stream
}