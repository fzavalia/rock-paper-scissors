import { Socket } from "socket.io";
import Commands from "./commands";
import * as events from "./events";
import { Hand, HandComparison, Game } from "./models";

export default class Handlers {
  constructor(private sockets: Map<string, Socket>, private commands: Commands) {}

  createLobby = (socket: Socket, gameType: number) => {
    const lobby = this.commands.createLobby(gameType);
    socket.emit(events.CREATED_LOBBY, lobby);
  };

  joinLobby = (socket: Socket, lobbyId: string) => {
    const lobby = this.commands.joinLobby(socket.id, lobbyId);
    lobby.playerIds.forEach(x => this.sockets.get(x)?.emit(events.JOINED_LOBBY, lobby));
  };

  createGame = (lobbyId: string) => {
    const game = this.commands.createGame(lobbyId);
    this.emitForPlayers(game, events.CREATED_GAME, game);
  };

  disconnect = (socket: Socket) => {
    this.sockets.delete(socket.id);
    const game = this.commands.disconnect(socket.id);
    if (game) {
      const [player1Id, player2Id] = game.getPlayerIds();
      const playerId = player1Id === socket.id ? player2Id : player1Id;
      this.sockets.get(playerId)?.emit(events.OPPONENT_DISCONNECTED, game);
    }
  };

  playHand = (socket: Socket, gameId: string, hand: string) => {
    const game = this.commands.playHand(gameId, socket.id, Hand.fromString(hand));
    this.emitForPlayers(game, events.PLAYED_HAND, socket.id);
    if (game.isRoundOver()) {
      const roundWinner = game.getRoundWinner();
      this.emitForPlayers(game, events.ROUND_FINISHED, { winner: roundWinner, game });
      if (game.isOver()) {
        const gameWinner = game.getWinner();
        this.emitForPlayers(game, events.GAME_FINISHED, gameWinner);
      } else {
        game.startNextRound();
      }
    }
  };

  connection = (socket: Socket) => {
    this.sockets.set(socket.id, socket);
    socket.on(events.CREATE_LOBBY, bestOf => this.createLobby(socket, bestOf));
    socket.on(events.JOIN_LOBBY, lobbyId => this.joinLobby(socket, lobbyId));
    socket.on(events.CREATE_GAME, lobbyId => this.createGame(lobbyId));
    socket.on(events.PLAY_HAND, data => this.playHand(socket, data.gameId, data.hand));
    socket.on(events.DISCONNECT, () => this.disconnect(socket));
  };

  private emitForPlayers = (game: Game, event: string, data?: any) =>
    game.getPlayerIds().forEach(socketId => this.sockets.get(socketId)?.emit(event, data));
}
