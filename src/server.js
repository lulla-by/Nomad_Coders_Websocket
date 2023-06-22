import express from "express";
import http from "http";
import Websocket from "ws";
import SocketIO from "socket.io";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
//home.pug를 라우트해주는 라우터
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));
const handleListen = () => console.log(`Listening on http://localhost:3000`);

// socket.io방식
const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);



// 방리스트

function publicRooms() {
  const { sockets: { adapter: { sids, rooms } } } = wsServer;
  const publicRooms=[];
  rooms.forEach((_,key)=>
  {if(sids.get(key)===undefined){
    publicRooms.push(key)
  }});
  return publicRooms
}




wsServer.on("connection", socket => {
  socket["nickname"] = "Anon"
  socket.onAny((event) => {
    console.log(wsServer.sockets.adapter);
    console.log(`Socket Event:${event}`);
  })
  // 커스텀 이벤트를 받아오고, 객체 출력이 가능, callback함수 실행
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done()
    // 해당 룸으로 본인을 제외하고 emit을 보냄
    socket.to(roomName).emit("welcome", socket.nickname);
  })
  socket.on("disconnecting", () => {
    socket.rooms.forEach(room => { socket.to(room).emit("bye", socket.nickname) })
  })
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname} : ${msg}`)
    done();
  })
  socket.on("nickname", (nickname) => {
    socket["nickname"] = nickname
  })
})
httpServer.listen(3000, handleListen);

// 기존 websocket 방식
// const server = http.createServer(app);
// const wss = new Websocket.Server({ server });
// const sockets = [];
// wss.on("connection", (socket) => {
//   sockets.push(socket);
//   socket["nickname"] = "annoymous";
//   console.log("connect to Browser");
//   //close라는 이벤트를 리슨, close를 발생시키려면 서버를 끄면 됨
//   socket.on("close", () => {
//     console.log("Disconnected from the Browser❌");
//   });
//   socket.on("message", (msg) => {
//     const message = JSON.parse(msg);
//     switch (message.type) {
//       case "new_message":
//         console.log(socket.nickname);
//         sockets.forEach((aSocket) =>
//           aSocket.send(`${socket.nickname}:${message.payload.toString()}`)
//         );
//         break;
//       case "nickname":
//         socket["nickname"] = message.payload;
//         break;
//     }
//   });
// });
// server.listen(3000, handleListen);
