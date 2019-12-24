import io from "socket.io";
import express from "express";
import http from "http";

const app = express();
const server = http.createServer(app);
const wss = io(server);

wss.on("connection", function(socket) {
  socket.emit("chat message", "I connected")
  wss.emit("chat message", "Someone Connected")
});

server.listen(8080, function() {
  console.log("listening on *:8080");
});
