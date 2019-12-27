import { Socket } from "socket.io";
import * as events from "./events";
import Game from "./model/Game";
import Lobby from "./model/Lobby";
import uuid from "uuid/v4";
import Hand from "./model/Hand";

export default class Handlers {
  constructor(
    private readonly sockets: Map<string, Socket>,
    private readonly games: Map<string, Game>,
    private readonly lobbies: Map<string, Lobby>
  ) {}

  createLobby = (socket: Socket, bestOf: number) => {
    const lobby: Lobby = new Lobby(uuid(), bestOf);
    this.lobbies.set(lobby.id, lobby);
    socket.emit(events.CREATED_LOBBY, lobby);
  };

  joinLobby = (socket: Socket, lobbyId: string) => {
    const lobby = this.getLobby(lobbyId);
    lobby.join(socket.id);
    this.emitToLobbyPlayers(lobby, events.JOINED_LOBBY, { lobby, playerId: socket.id });
  };

  createGame = (lobbyId: string) => {
    const lobby = this.getLobby(lobbyId);
    const game = lobby.toGame();
    this.games.set(game.id, game);
    this.emitToGamePlayers(game, events.CREATED_GAME, { game });
  };

  disconnect = (socket: Socket) => {
    this.sockets.delete(socket.id);
    this.handleLobbyOnDisconnect(socket);
    this.handleGameOnDisconnect(socket);
  };

  playHand = (socket: Socket, gameId: string, hand: string) => {
    const game = this.getGame(gameId);
    game.playHand(socket.id, Hand.fromString(hand));
    this.emitToGamePlayers(game, events.PLAYED_HAND, { game, playerId: socket.id });
    if (game.isRoundOver()) {
      this.emitToGamePlayers(game, events.ROUND_FINISHED, { game, winner: game.getRoundWinner() });
      if (!game.isOver()) {
        game.startNextRound();
      } else {
        this.emitToGamePlayers(game, events.GAME_FINISHED, { game, winner: game.getWinner() });
        this.games.delete(game.id);
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

  private getLobby = (lobbyId: string): Lobby => {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      throw new Error("Lobby not found");
    }
    return lobby;
  };

  private getGame = (gameId: string): Game => {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error("Game not found");
    }
    return game;
  };

  private handleLobbyOnDisconnect = (socket: Socket) => {
    let lobby: Lobby | undefined;
    for (let l of Array.from(this.lobbies.values())) {
      if (l.hasPlayer(socket.id)) {
        lobby = l;
        break;
      }
    }
    if (lobby) {
      lobby.remove(socket.id);
      if (lobby.isEmpty()) {
        this.lobbies.delete(lobby.id);
      } else {
        this.emitToLobbyPlayers(
          lobby,
          events.JOINED_LOBBY,
          { lobby, playerId: socket.id },
          playerId => playerId !== socket.id
        );
      }
    }
  };

  private handleGameOnDisconnect = (socket: Socket) => {
    let game: Game | undefined;
    for (let g of Array.from(this.games.values())) {
      if (g.hasPlayer(socket.id)) {
        game = g;
        break;
      }
    }
    if (game) {
      this.games.delete(game.id);
      this.emitToGamePlayers(
        game,
        events.OPPONENT_DISCONNECTED,
        { game, playerId: socket.id },
        playerId => playerId !== socket.id
      );
    }
  };

  private emitToGamePlayers = (
    game: Game,
    event: string,
    payload: any,
    filter: (playerId: string) => boolean = () => true
  ) => this.emit(game.getPlayerIds(), event, payload, filter);

  private emitToLobbyPlayers = (
    lobby: Lobby,
    event: string,
    payload: any,
    filter: (playerId: string) => boolean = () => true
  ) => this.emit(lobby.getPlayerIds(), event, payload, filter);

  private emit = (ids: string[], event: string, payload: any, filter: (id: string) => boolean = () => true) =>
    ids.filter(filter).forEach(playerId => this.sockets.get(playerId)?.emit(event, payload));
}
