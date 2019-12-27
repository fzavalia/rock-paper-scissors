import io from "socket.io";
import express from "express";
import http from "http";
import * as events from "./events";
import Handlers from "./handlers";

const app = express();
const server = http.createServer(app);
const wss = io(server);

const handlers = new Handlers(new Map(), new Map(), new Map());

wss.on(events.CONNECTION, handlers.connection);

server.listen(8080, function() {
  console.log("listening on *:8080");
});
