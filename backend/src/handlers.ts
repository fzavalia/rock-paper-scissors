import { Socket } from "socket.io";
import Commands from "./commands";
import * as events from "./events";
import { Hand, HandComparison, GameType, Game } from "./models";

export default class Handlers {
  constructor(private sockets: Map<string, Socket>, private commands: Commands) {}

  createLobby = (socket: Socket, gameType: GameType) => {
    const lobby = this.commands.createLobby(gameType);
    socket.emit(events.CREATED_LOBBY, lobby);
  };

  joinLobby = (socket: Socket, lobbyId: string) => {
    const lobby = this.commands.joinLobby(socket.id, lobbyId);
    lobby.playerIds.forEach(x => this.sockets.get(x)?.emit(events.JOINED_LOBBY, lobby));
  };

  createGame = (lobbyId: string) => {
    const game = this.commands.createGame(lobbyId);
    this.emitMany([game.player1Id, game.player2Id], events.CREATED_GAME, game);
  };

  disconnect = (socket: Socket) => {
    this.sockets.delete(socket.id);
    const game = this.commands.disconnect(socket.id);
    if (game) {
      const { player1Id, player2Id } = game;
      const playerId = player1Id === socket.id ? player2Id : player1Id;
      this.sockets.get(playerId)?.emit(events.OPPONENT_DISCONNECTED, game);
    }
  };

  playHand = (socket: Socket, gameId: string, hand: string) => {
    const game = this.commands.playHand(gameId, socket.id, Hand.fromString(hand));
    const { player1Id, player2Id } = game;
    this.emitMany([player1Id, player2Id], events.PLAYED_HAND, socket.id);
    const rounds = game.rounds;
    const hands = rounds[rounds.length - 1].hands;
    const player1Hand = hands.get(player1Id);
    const player2Hand = hands.get(player2Id);
    if (player1Hand && player2Hand) {
      const result = player1Hand.compare(player2Hand);
      const winner = result === HandComparison.TIE ? player1Id : result === HandComparison.LOSE ? player2Id : undefined;
      this.emitMany([player1Id, player2Id], events.ROUND_FINISHED, winner);
      const totalWins = rounds
        .map(round => round.hands)
        .map(hands => {
          const player1Hand = hands.get(player1Id);
          const player2Hand = hands.get(player2Id);
          if (player1Hand && player2Hand) {
            return player1Hand.compare(player2Hand);
          }
        })
        .reduce(
          (acc, next) => {
            if (next === HandComparison.WIN) {
              acc[0]++;
            } else if (next === HandComparison.LOSE) {
              acc[1]++;
            }
            return acc;
          },
          [0, 0]
        );
      const [player1Wins, player2Wins] = totalWins;
      if (player1Wins + player2Wins < game.type) {
        this.commands.nextRound(gameId);
      } else {
        this.emitMany([player1Id, player2Id], events.GAME_FINISHED, player1Wins > player2Wins ? player1Id : player2Id);
      }
    }
  };

  connection = (socket: Socket) => {
    this.sockets.set(socket.id, socket);
    socket.on(events.CREATE_LOBBY, gameType => this.createLobby(socket, this.gameTypeFromString(gameType)));
    socket.on(events.JOIN_LOBBY, lobbyId => this.joinLobby(socket, lobbyId));
    socket.on(events.CREATE_GAME, lobbyId => this.createGame(lobbyId));
    socket.on(events.PLAY_HAND, data => this.playHand(socket, data.gameId, data.hand));
    socket.on(events.DISCONNECT, () => this.disconnect(socket));
  };

  private emitMany = (socketIds: string[], event: string, data?: any) => {
    socketIds.forEach(socketId => this.sockets.get(socketId)?.emit(event, data));
  };

  private gameTypeFromString = (str: string) => {
    const gameTypeMap = new Map([
      ["single", GameType.Single],
      ["best3", GameType.Best3],
      ["best5", GameType.Best5]
    ]);
    const gameType = gameTypeMap.get(str);
    if (!gameType) {
      throw new Error("Invalid game type");
    }
    return gameType;
  };
}
