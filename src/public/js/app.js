const host = window.location.host
const socket = new WebSocket("ws://"+host)
// 여기서의 socket은 서버로의 연결

socket.addEventListener("open",()=>{
  console.log("connect to Server🟩");
})

socket.addEventListener("message",(message)=>{
console.log(`New Message: ${message.data} from the Server`);
  
})

socket.addEventListener("close",()=>{
  console.log("Disconnected from the Server❌");
})

// setTimeout(()=>{
//   socket.send("hello from the Browser!")
// },10000)