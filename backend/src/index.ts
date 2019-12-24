import io, { Socket } from "socket.io";
import express from "express";
import http from "http";
import * as events from "./events";
import Handlers from "./handlers";
import Commands from "./commands";
import { Game } from "./models";

const app = express();
const server = http.createServer(app);
const wss = io(server);

const commands = new Commands(new Map<string, Game>());
const handlers = new Handlers(new Map<string, Socket>(), commands);

wss.on(events.CONNECTION, handlers.connection);

server.listen(8080, function() {
  console.log("listening on *:8080");
});
