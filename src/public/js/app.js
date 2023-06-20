const messageList = document.querySelector("ul")
const messageForm = document.querySelector("#message")
const nickForm = document.querySelector("#nick")
const host = window.location.host
const socket = new WebSocket("ws://"+host)
// 여기서의 socket은 서버로의 연결

function makeMessage(type,payload) {
  const msg = {type,payload}
  return JSON.stringify(msg)
}

socket.addEventListener("open",()=>{
  console.log("connect to Server🟩");
})

socket.addEventListener("message",(message)=>{
console.log(`New Message: ${message.data} `);

const li = document.createElement("li")
li.innerText = message.data
messageList.append(li)  
})

socket.addEventListener("close",()=>{
  console.log("Disconnected from the Server❌");
})



const handleSubmit =(e)=>{
  e.preventDefault()
  const input = messageForm.querySelector("input")
  socket.send(makeMessage("new_message",input.value))
  input.value=""
}
const handleNickSubmit =(e)=>{
  e.preventDefault()
  const input = nickForm.querySelector("input")
  socket.send(makeMessage("nickname",input.value)
  )
}
messageForm.addEventListener("submit",handleSubmit)
nickForm.addEventListener("submit",handleNickSubmit)