import { Socket } from "socket.io";
import * as events from "./events";
import Game from "./model/Game";
import Lobby from "./model/Lobby";
import uuid from "uuid/v4";
import Hand from "./model/Hand";
import HasPlayers from "./model/interfaces/HasPlayers";

export default class Connection {
  constructor(
    private readonly socket: Socket,
    private readonly sockets: Map<string, Socket>,
    private readonly games: Map<string, Game>,
    private readonly lobbies: Map<string, Lobby>
  ) {
    socket.on(events.CREATE_LOBBY, bestOf => this.createLobby(bestOf));
    socket.on(events.JOIN_LOBBY, lobbyId => this.joinLobby(lobbyId));
    socket.on(events.CREATE_GAME, lobbyId => this.createGame(lobbyId));
    socket.on(events.PLAY_HAND, data => this.playHand(data.gameId, data.hand));
    socket.on(events.DISCONNECT, () => this.disconnect());
  }

  createLobby = (bestOf: number) => {
    const lobby: Lobby = new Lobby(uuid(), bestOf);
    this.lobbies.set(lobby.id, lobby);
    this.socket.emit(events.CREATED_LOBBY, lobby);
  };

  joinLobby = (lobbyId: string) => {
    const lobby = this.getLobby(lobbyId);
    lobby.join(this.socket.id);
    this.emitToPlayers(lobby, events.JOINED_LOBBY, { lobby, playerId: this.socket.id });
  };

  createGame = (lobbyId: string) => {
    const lobby = this.getLobby(lobbyId);
    const game = lobby.toGame();
    this.games.set(game.id, game);
    this.emitToPlayers(game, events.CREATED_GAME, { game });
  };

  disconnect = () => {
    this.sockets.delete(this.socket.id);
    this.handleLobbyOnDisconnect();
    this.handleGameOnDisconnect();
  };

  playHand = (gameId: string, hand: string) => {
    const game = this.getGame(gameId);
    game.playHand(this.socket.id, Hand.fromString(hand));
    this.emitToPlayers(game, events.PLAYED_HAND, { game, playerId: this.socket.id });
    if (game.isRoundOver()) {
      this.emitToPlayers(game, events.ROUND_FINISHED, { game, winner: game.getRoundWinner() });
      if (!game.isOver()) {
        game.startNextRound();
      } else {
        this.emitToPlayers(game, events.GAME_FINISHED, { game, winner: game.getWinner() });
        this.games.delete(game.id);
      }
    }
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

  private handleLobbyOnDisconnect = () => {
    let lobby = this.getWhereSocketIsPlayer(Array.from(this.lobbies.values()));
    if (lobby) {
      lobby.remove(this.socket.id);
      if (lobby.isEmpty()) {
        this.lobbies.delete(lobby.id);
      } else {
        this.emitToPlayers(
          lobby,
          events.JOINED_LOBBY,
          { lobby, playerId: this.socket.id },
          playerId => playerId !== this.socket.id
        );
      }
    }
  };

  private handleGameOnDisconnect = () => {
    let game = this.getWhereSocketIsPlayer(Array.from(this.games.values()));
    if (game) {
      this.games.delete(game.id);
      this.emitToPlayers(
        game,
        events.OPPONENT_DISCONNECTED,
        { game, playerId: this.socket.id },
        playerId => playerId !== this.socket.id
      );
    }
  };

  private getWhereSocketIsPlayer = <T extends HasPlayers>(xs: T[]) => {
    let x: T | undefined;
    for (let i of xs) {
      if (i.hasPlayer(this.socket.id)) {
        x = i;
        break;
      }
    }
    return x;
  };

  private emitToPlayers = (
    x: HasPlayers,
    event: string,
    payload: any,
    filter: (playerId: string) => boolean = () => true
  ) => {
    x.getPlayerIds()
      .filter(filter)
      .forEach(playerId => this.sockets.get(playerId)?.emit(event, payload));
  };
}