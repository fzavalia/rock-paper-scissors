import io from "socket.io";
import express from "express";
import http from "http";
import * as events from "./events";
import * as handlers from "./handlers";

const app = express();
const server = http.createServer(app);
const wss = io(server);

wss.on(events.CONNECTION, handlers.connection);

server.listen(8080, function() {
  console.log("listening on *:8080");
});
