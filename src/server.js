import express from "express"
import http from "http"
import Websocket from "ws"

const app = express()

app.set("view engine","pug")
app.set("views",__dirname+"/views");
app.use("/public",express.static(__dirname+"/public"))
//home.pug를 라우트해주는 라우터
app.get("/",(req,res)=>res.render("home"))
app.get("/*", (req,res)=>res.redirect("/"))
const handleListen = () => console.log(`Listening on http://localhost:3000`);
// 기존의 서버 생성 방식
// app.listen(3000,handleListen);

// ws와 http를 합치기 위해
// express app으로부터 http.creatServer()를 통해 http 서버 생성
const server = http.createServer(app)

//server에 접근 가능 => websocket생성 가능
const wss = new Websocket.Server({server})

const  onSocketClose =()=> {
  console.log("Disconnected from the Browser❌")
}

function onSocketMessage (message){
  socket.send(message.toString("utf-8"));
  // socket.send(message.toString("utf-8"))
}

// 여러 소켓을 구성
const sockets = []

wss.on("connection",(socket)=>{
  sockets.push(socket)
  socket["nickname"]="annoymous"
  console.log("connect to Browser");
  //close라는 이벤트를 리슨, close를 발생시키려면 서버를 끄면 됨
  socket.on("close",onSocketClose)
  socket.on("message",(msg)=>{ 
    const message = JSON.parse(msg)
    switch (message.type){
      case "new_message":
        console.log(socket.nickname)
        sockets.forEach(aSocket=>aSocket.send(`${socket.nickname}:${message.payload.toString()}`))
        break
      case "nickname":
        socket["nickname"] = message.payload
        break

    }
  })
})
server.listen(3000, handleListen)


