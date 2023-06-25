// io 함수는 알아서 socket.io를 실행하는 서버를 찾을 것
const socket = io();

//1. 유저로부터 비디오를 가져와서 화면에 보여줌
//2. 마이크를 음소거 및 음소거 해제하는 버튼 생성
//3. 핸드폰 전면 후면 카메라

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const call = document.getElementById("call")

call.hidden = true

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;


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
}

muteBtn.addEventListener("click", handleMuteClick)
cameraBtn.addEventListener("click", handleCameraClick)
camerasSelect.addEventListener("input", handleCameraChange)




// welcome Form

const welcome = document.getElementById("welcome")
welcomeForm = welcome.querySelector("form");

async function startMedia(params) {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia()
  makeConnection()
}


function handleWelcomeSubmit (e) {
e.preventDefault()
const input = welcomeForm.querySelector("input")
socket.emit("join_room",input.value,startMedia)
roomName = input.value
input.value=""
}

welcomeForm.addEventListener("submit",handleWelcomeSubmit)


//socket Code
socket.on("welcome",async ()=>{
  //peer A에서 offer를 생성하여 서버로 전송
 const offer = await myPeerConnection.createOffer();
 myPeerConnection.setLocalDescription(offer)
 console.log("sent the offer");
 socket.emit("offer",offer,roomName)
})

//peer B는 offer를 받음
socket.on("offer",(offer)=>{
console.log(offer);
})

//RTC code

function makeConnection(){
myPeerConnection = new RTCPeerConnection();
myStream.getTracks().forEach(track=>myPeerConnection.addTrack(track,myStream))
}