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

const scheduleStaleElementsRemoval = (map: Map<string, { lastInteraction: Date }>, name: string) => {
  const tenMinutes = 10 * 60 * 1000;
  setInterval(() => {
    console.log(`--- Deleting stale elements (${name})`);
    const now = +new Date();
    Array.from(map)
      .filter(([_, element]) => now - +element.lastInteraction > tenMinutes)
      .forEach(([id, _]) => {
        map.delete(id);
        console.log(id);
      });
    console.log(`--- Finished deleting stale elements (${name})`);
  }, tenMinutes);
};

scheduleStaleElementsRemoval(games, "game");
scheduleStaleElementsRemoval(lobbies, "lobby");

wss.on(events.CONNECTION, socket => new Connection(socket, sockets, games, lobbies));

server.listen(8080, function() {
  console.log("listening on *:8080");
});
