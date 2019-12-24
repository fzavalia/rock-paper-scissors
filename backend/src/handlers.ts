import { Socket } from "socket.io";
import * as commands from "./commands";
import * as events from "./events";
import { Hand, sockets } from "./state";

export const startGame = (socket: Socket) => {
  const data = commands.startGame(socket.id);
  socket.emit(events.GAME_STARTED, data);
};

export const joinGame = (socket: Socket, gameId: string) => {
  const game = commands.joinGame(socket.id, gameId);
  if (game) {
    const player1Socket = sockets.get(game.player1);
    player1Socket?.emit(events.OPPONENT_JOINED_GAME);
    socket.emit(events.JOINED_GAME);
  }
};

export const disconnect = (socket: Socket) => {
  sockets.delete(socket.id);
  const opponent = commands.disconnect(socket.id);
  if (opponent) {
    sockets.get(opponent)?.emit(events.OPPONENT_DISCONNECTED);
  }
};

export const playHand = (socket: Socket, hand: Hand) => {
  const opponent = commands.playHand(socket.id, hand);
  if (opponent) {
    sockets.get(socket.id)?.emit(events.PLAYED_HAND);
    sockets.get(opponent)?.emit(events.OPPONENT_PLAYED_HAND);
  }
};

export const connection = (socket: Socket) => {
  sockets.set(socket.id, socket);
  socket.on(events.START_GAME, () => startGame(socket));
  socket.on(events.JOIN_GAME, gameId => joinGame(socket, gameId));
  socket.on(events.DISCONNECT, () => disconnect(socket));
  socket.on(events.PLAY_HAND, (hand: Hand) => playHand(socket, hand));
  // TODO: Game Finished
};
