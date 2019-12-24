import io from "socket.io";
import express from "express";
import http from "http";
import uuid from "uuid/v4";

const app = express();
const server = http.createServer(app);
const wss = io(server);

type Hand = "rock" | "paper" | "scissors";

interface Game {
  id: string;
  player1: string;
  player2?: string;
  player1hand?: Hand;
  player2hand?: Hand;
}

const games: Map<string, Game> = new Map();

const sockets: Map<string, io.Socket> = new Map();

wss.on("connection", function(socket) {
  const playerId = socket.id;
  const playerSocket = socket;
  sockets.set(playerId, playerSocket);

  socket.on("start-game", () => {
    const gameId = uuid();
    const game: Game = { id: gameId, player1: playerId };
    games.set(gameId, game);
    socket.emit("game-started", { gameId, myId: playerId });
  });

  socket.on("join-game", gameId => {
    const game = games.get(gameId);
    if (game && !game.player2) {
      game.player2 = playerId;
      const player1Socket = sockets.get(game.player1);
      player1Socket?.emit("opponent-joined-game");
      playerSocket.emit("joined-game");
    }
  });

  socket.on("disconnect", () => {
    sockets.delete(playerId);
    let game: Game | undefined;
    for (let gameId in games) {
      game = games.get(gameId);
      if (
        game &&
        game.player2 &&
        (game.player1 === playerId || game.player2 === playerId)
      )
        break;
    }
    if (game && game.player2) {
      const { player1, player2, id: gameId } = game;
      if (player1 === playerId)
        sockets.get(player2)?.emit("opponent-disconnected");
      if (player2 === playerId)
        sockets.get(player1)?.emit("opponent-disconnected");
      games.delete(gameId);
    }
  });

  socket.on("play-hand", (data: { gameId: string; hand: Hand }) => {
    const game = games.get(data.gameId);
    if (game && game.player2) {
      const { player1, player2 } = game;
      if (player1 === playerId) {
        game.player1hand = data.hand;
        sockets.get(player1)?.emit("played-hand");
        sockets.get(player2)?.emit("opponent-played-hand");
      }
      if (player2 === playerId) {
        game.player2hand = data.hand;
        sockets.get(player2)?.emit("played-hand");
        sockets.get(player1)?.emit("opponent-played-hand");
      }
    }
  });

  // TODO: Game Finished
});

server.listen(8080, function() {
  console.log("listening on *:8080");
});
