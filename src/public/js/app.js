// io 함수는 알아서 socket.io를 실행하는 서버를 찾을 것
const socket = io();

//socket.io에는 기본적으로 room기능이 있음
const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName = ""

function handleMessageSubmit(e) {
  e.preventDefault();
  const input = room.querySelector("input");
  socket.emit("new_message",input.value,roomName,()=>{
    addMessage(`You: ${input.value}`)
    input.value=""
  });
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3")
  h3.innerText = `Room ${roomName}`
  const form = room.querySelector("form");
  form.addEventListener("submit",handleMessageSubmit)
}
function handleRoomSubmit(e) {
  e.preventDefault();
  const input = form.querySelector("input");
  // websocket에 비해 향상된 점
  // => 커스텀 이벤트 생성가능, 객체를 payload로 보낼 수 있음, 서버에서 호출하는 함수
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit)

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

// welcome을 받으면 함수 실행
socket.on("welcome", () => {
addMessage("Someone Joined!")
})

socket.on("bye",()=>{
  addMessage("Someone left!")
})

socket.on("new_message",addMessage)