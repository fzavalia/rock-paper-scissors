import io from "socket.io";
import express from "express";
import http from "http";
import path from "path";

const app = express();
const server = http.createServer(app);
const wss = io(server);

app.get("/", function(req, res) {
  res.sendFile(path.resolve(__dirname, "../public/index.html"));
});

wss.on('connection', function(socket){
  socket.on('chat message', function(msg){
    wss.emit('chat message', msg);
  });
});

server.listen(3000, function() {
  console.log("listening on *:3000");
});
