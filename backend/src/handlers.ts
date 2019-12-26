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
      const { player1Id, player2Id } = game;
      const playerId = player1Id === socket.id ? player2Id : player1Id;
      this.sockets.get(playerId)?.emit(events.OPPONENT_DISCONNECTED, game);
    }
  };

  playHand = (socket: Socket, gameId: string, hand: string) => {
    const game = this.commands.playHand(gameId, socket.id, Hand.fromString(hand));
    const { player1Id, player2Id } = game;
    this.emitForPlayers(game, events.PLAYED_HAND, socket.id);
    if (this.bothPlayersPlayedLastRound(game)) {
      const winner = this.getLastRoundWinner(game);
      this.emitForPlayers(game, events.ROUND_FINISHED, { winner, game });
      const gameWins = this.getWins(game);
      if (gameWins.total < game.bestOf) {
        this.commands.nextRound(gameId);
      } else {
        this.emitForPlayers(game, events.GAME_FINISHED, gameWins.p1 > gameWins.p2 ? player1Id : player2Id);
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

  private emitForPlayers = (game: Game, event: string, data?: any) => {
    const socketIds = [game.player1Id, game.player2Id];
    socketIds.forEach(socketId => this.sockets.get(socketId)?.emit(event, data));
  };

  private getWins = (game: Game) => {
    const wins = this.getPlayer1Results(game).reduce(
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
    return {
      total: wins[0] + wins[1],
      p1: wins[0],
      p2: wins[1]
    };
  };

  private getPlayer1Results = (game: Game) =>
    game.rounds
      .map(round => round.hands)
      .map(hands => {
        const player1Hand = hands.get(game.player1Id);
        const player2Hand = hands.get(game.player2Id);
        if (player1Hand && player2Hand) {
          return player1Hand.compare(player2Hand);
        }
      });

  private bothPlayersPlayedLastRound = (game: Game) => {
    const hands = game.rounds[game.rounds.length - 1].hands;
    return hands.has(game.player1Id) && hands.has(game.player2Id);
  };

  private getLastRoundWinner = (game: Game) => {
    const hands = game.rounds[game.rounds.length - 1].hands;
    const player1Hand = hands.get(game.player1Id);
    const player2Hand = hands.get(game.player2Id);
    if (player1Hand && player2Hand) {
      const comparison = player1Hand.compare(player2Hand);
      return comparison === HandComparison.WIN
        ? game.player1Id
        : comparison === HandComparison.LOSE
        ? game.player2Id
        : undefined;
    }
  };
}
