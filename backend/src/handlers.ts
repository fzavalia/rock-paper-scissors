import { Socket } from "socket.io";
import Commands from "./commands";
import * as events from "./events";
import { Hand } from "./models";

export default class Handlers {
  constructor(
    private sockets: Map<string, Socket>,
    private commands: Commands
  ) {}

  startGame = (socket: Socket) => {
    const data = this.commands.startGame(socket.id);
    socket.emit(events.GAME_STARTED, data);
  };

  joinGame = (socket: Socket, gameId: string) => {
    const game = this.commands.joinGame(socket.id, gameId);
    if (game) {
      const player1Socket = this.sockets.get(game.player1);
      player1Socket?.emit(events.OPPONENT_JOINED_GAME);
      socket.emit(events.JOINED_GAME);
    }
  };

  disconnect = (socket: Socket) => {
    this.sockets.delete(socket.id);
    const opponent = this.commands.disconnect(socket.id);
    if (opponent) {
      this.sockets.get(opponent)?.emit(events.OPPONENT_DISCONNECTED);
    }
  };

  playHand = (socket: Socket, hand: Hand) => {
    const opponent = this.commands.playHand(socket.id, hand);
    if (opponent) {
      this.sockets.get(socket.id)?.emit(events.PLAYED_HAND);
      this.sockets.get(opponent)?.emit(events.OPPONENT_PLAYED_HAND);
    }
  };

  connection = (socket: Socket) => {
    this.sockets.set(socket.id, socket);
    socket.on(events.START_GAME, () => this.startGame(socket));
    socket.on(events.JOIN_GAME, gameId => this.joinGame(socket, gameId));
    socket.on(events.DISCONNECT, () => this.disconnect(socket));
    socket.on(events.PLAY_HAND, (hand: Hand) => this.playHand(socket, hand));
    // TODO: Game Finished
  };
}
