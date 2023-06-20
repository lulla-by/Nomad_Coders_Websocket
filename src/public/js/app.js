const messageList = document.querySelector("ul")
const messageForm = document.querySelector("form")
const host = window.location.host
const socket = new WebSocket("ws://"+host)
// 여기서의 socket은 서버로의 연결

socket.addEventListener("open",()=>{
  console.log("connect to Server🟩");
})

socket.addEventListener("message",(message)=>{
console.log(`New Message: ${message.data} `);
  
})

socket.addEventListener("close",()=>{
  console.log("Disconnected from the Server❌");
})



const handleSubmit =(e)=>{
  e.preventDefault()
  const input = messageForm.querySelector("input")
  socket.send(input.value)
  input.value=""
}
messageForm.addEventListener("submit",handleSubmit)