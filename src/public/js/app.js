// io 함수는 알아서 socket.io를 실행하는 서버를 찾을 것
const socket = io();

//socket.io에는 기본적으로 room기능이 있음
const welcome = document.getElementById("welcome")
const form = welcome.querySelector("form")


function handleRoomSubmit(e){
e.preventDefault();
const input = form.querySelector("input");
// websocket에 비해 향상된 점
// => 커스텀 이벤트 생성가능, 객체를 payload로 보낼 수 있음, 서버에서 호출하는 함수
socket.emit("enter_room",{ payload:input.value },()=>{console.log("Server is done");})
input.value="";
}

form.addEventListener("submit",handleRoomSubmit)