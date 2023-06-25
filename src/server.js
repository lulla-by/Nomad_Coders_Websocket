import express from "express";
import http from "http";
// import Websocket from "ws";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

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
const wsServer = new Server(httpServer,
  {
    cors: {
      origin: ["https://admin.socket.io"],
      credentials: true,
    },
  });

instrument(wsServer, {
  auth: false,
}
);



// 방리스트

function publicRooms() {
  const { sockets: { adapter: { sids, rooms } } } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key)
      // console.log(publicRooms)
    }
  });
  // 현재 우리 서버안에 있는 모든 서버의 어레이를 제공
  return publicRooms
}

// 참가자 수를 세는 함수
function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}


wsServer.on("connection", socket => {
  //연결
  wsServer.sockets.emit("room_change", publicRooms())
  socket["nickname"] = "Anon"
  socket.onAny((event) => {
    console.log(wsServer.sockets.adapter);
    console.log(`Socket Event:${event}`);
  })
  // 방생성,입장
  socket.on("enter_room", (roomName, done) => {
    // 입장
    socket.join(roomName);
    done(countRoom(roomName))
    // 입장 메세지
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    // 방 생성
    wsServer.sockets.emit("room_change", publicRooms())
  })

  // 방 삭제
  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms())
  })

  // 채팅방 나가기 직전
  socket.on("disconnecting", () => {
    socket.rooms.forEach(room => { socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1) })
  })

  // 메세지
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname} : ${msg}`)
    done();
  })

  //닉네임 변경
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
