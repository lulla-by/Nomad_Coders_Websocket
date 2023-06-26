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

// socket.io방식
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer)

function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
  socket.on("join_room", (roomName) => {
    // 인원 수 제한
    const member = countRoom(roomName);
    if (member >= 2) {
      socket.emit("room_full");
      return;
    }
    socket.join(roomName)
    socket.to(roomName).emit("welcome")
  })

  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  })

  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer)
  })

  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice)
  })

  socket.on("chat", (roomName, chat) => {
    socket.to(roomName).emit("chat", chat)
  })
})

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);
