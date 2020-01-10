import io, { Socket } from "socket.io";
import express from "express";
import http from "http";
import path from "path";
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
  const minutes = {
    60: 60 * 60 * 1000,
    30: 30 * 60 * 1000
  };
  setInterval(() => {
    console.log(`--- Deleting stale elements (${name})`);
    const now = +new Date();
    Array.from(map)
      .filter(([_, element]) => now - +element.lastInteraction > minutes[60])
      .forEach(([id, _]) => {
        map.delete(id);
        console.log(id);
      });
    console.log(`--- Finished deleting stale elements (${name})`);
  }, minutes[30]);
};

scheduleStaleElementsRemoval(games, "game");
scheduleStaleElementsRemoval(lobbies, "lobby");

wss.on(events.CONNECTION, socket => new Connection(socket, sockets, games, lobbies));

app.use(express.static(path.resolve(__dirname, "public")));

app.get("*", (_, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

server.listen(8080, function() {
  console.log("listening on *:8080");
});
