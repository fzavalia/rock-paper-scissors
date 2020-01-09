import io, { Socket } from "socket.io";
import express from "express";
import http from "http";
import * as events from "./events";
import Connection from "./Connection";
import Game from "./model/Game";
import Lobby from "./model/Lobby";

const app = express();
const server = http.createServer(app);
const wss = io(server);

const sockets = new Map<string, Socket>();
const games = new Map<string, Game>();
const lobbies = new Map<string, Lobby>();

const tenMinutes = 10 * 60 * 1000;

setInterval(() => {
  console.log("Deleting stale games...");
  const now = +new Date();
  Array.from(games)
    .filter(([_, game]) => now - +game.lastInteraction > tenMinutes)
    .forEach(([id, _]) => {
      games.delete(id);
      console.log(`Deleted game ${id}!`);
    });
}, tenMinutes);

setInterval(() => {
  console.log("Deleting stale lobbies...");
  const now = +new Date();
  Array.from(lobbies)
    .filter(([_, lobby]) => now - +lobby.lastInteraction > tenMinutes)
    .forEach(([id, _]) => {
      lobbies.delete(id);
      console.log(`Deleted lobby ${id}!`);
    });
}, tenMinutes);

wss.on(events.CONNECTION, socket => new Connection(socket, sockets, games, lobbies));

server.listen(8080, function() {
  console.log("listening on *:8080");
});
