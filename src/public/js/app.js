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
  const input = room.querySelector("#msg input");
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${input.value}`)
    input.value = ""
  });
}

function handleNicknameSubmit(e) {
  e.preventDefault();
  const input = room.querySelector("#name input");
  const value = input.value;
  socket.emit("nickname", input.value)
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3")
  h3.innerText = `Room ${roomName}`
  const msgForm = room.querySelector("#msg");
  const nameForm = room.querySelector("#name");
  msgForm.addEventListener("submit", handleMessageSubmit)
  nameForm.addEventListener("submit", handleNicknameSubmit)
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
socket.on("welcome", (user) => {
  addMessage(` ${user} Joined!`);
})

socket.on("bye", (user) => {
  addMessage(`${user} left!`);
})

socket.on("new_message", addMessage)

socket.on("room_change", (rooms) => {
  const roomlist = welcome.querySelector("ul");
  roomlist.innerHTML = "";
  if(rooms.length === 0){
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomlist.append(li);
  });
})