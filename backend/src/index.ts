import io from "socket.io";
import express from "express";
import http from "http";

const app = express();
const server = http.createServer(app);
const wss = io(server);

wss.on("connection", function(socket) {
  socket.on("chat message", function(msg) {
    wss.emit("chat message", msg);
  });
});

server.listen(8080, function() {
  console.log("listening on *:8080");
});
