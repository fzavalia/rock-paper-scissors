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
    sockets.set(socket.id, socket);
    this.on(events.CREATE_LOBBY, bestOf => this.createLobby(bestOf));
    this.on(events.JOIN_LOBBY, lobbyId => this.joinLobby(lobbyId));
    this.on(events.CREATE_GAME, lobbyId => this.createGame(lobbyId));
    this.on(events.JOIN_GAME, gameId => this.joinGame(gameId));
    this.on(events.PLAY_HAND, data => this.playHand(data.gameId, data.hand));
    this.on(events.DISCONNECT, () => this.disconnect());
  }

  private on = (event: string, f: (x: any) => void) => {
    this.socket.on(event, data => {
      console.log(Date.now(), event, data);
      try {
        f(data);
      } catch (e) {
        console.log(Date.now(), `Failed with ${e}`);
        this.socket.emit(events.RUNTIME_ERROR, { error: e.toString() });
      }
    });
  };

  private createLobby = (bestOf: number) => {
    const lobby: Lobby = new Lobby(uuid(), bestOf);
    this.lobbies.set(lobby.id, lobby);
    this.socket.emit(events.CREATED_LOBBY, { lobby: { id: lobby.id } });
  };

  private joinLobby = (lobbyId: string) => {
    const lobby = this.getLobby(lobbyId);
    lobby.join(this.socket.id);
    this.emitToPlayers(lobby, events.JOINED_LOBBY, {
      lobby: { id: lobbyId, playerIds: lobby.getPlayerIds(), bestOf: lobby.bestOf },
      playerId: this.socket.id
    });
  };

  private createGame = (lobbyId: string) => {
    const lobby = this.getLobby(lobbyId);
    const game = lobby.toGame();
    this.lobbies.delete(lobby.id);
    this.games.set(game.id, game);
    this.emitToPlayers(game, events.CREATED_GAME, { game: this.gameToResponse(game) });
  };

  private joinGame = (gameId: string) => {
    const game = this.getGame(gameId);
    if (!game.hasPlayer(this.socket.id)) {
      throw new Error("Player does not belong to game");
    }
    this.socket.emit(events.JOINED_GAME, { game: this.gameToResponse(game) });
  };

  private playHand = (gameId: string, hand: string) => {
    const game = this.getGame(gameId);
    game.playHand(this.socket.id, Hand.fromString(hand));
    this.emitToPlayers(game, events.PLAYED_HAND, { game: this.gameToResponse(game), playerId: this.socket.id });
    if (game.isRoundOver()) {
      this.emitToPlayers(game, events.ROUND_FINISHED, {
        game: this.gameToResponse(game),
        winner: game.getRoundWinner()
      });
      if (!game.isOver()) {
        game.startNextRound();
      } else {
        this.emitToPlayers(game, events.GAME_FINISHED, { game: this.gameToResponse(game), winner: game.getWinner() });
        this.games.delete(game.id);
      }
    }
    this.emitToPlayers(game, events.UPDATED_GAME, { game: this.gameToResponse(game) });
  };

  private disconnect = () => {
    this.sockets.delete(this.socket.id);
    this.handleLobbyOnDisconnect();
    this.handleGameOnDisconnect();
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
      }
      this.emitDisconnection(lobby);
    }
  };

  private handleGameOnDisconnect = () => {
    let game = this.getWhereSocketIsPlayer(Array.from(this.games.values()));
    if (game) {
      this.games.delete(game.id);
      this.emitDisconnection(game);
    }
  };

  private getWhereSocketIsPlayer = <T extends HasPlayers>(xs: T[]) => {
    let hp: T | undefined;
    for (let x of xs) {
      if (x.hasPlayer(this.socket.id)) {
        hp = x;
        break;
      }
    }
    return hp;
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

  private emitDisconnection = (x: HasPlayers) =>
    this.emitToPlayers(
      x,
      events.OPPONENT_DISCONNECTED,
      { playerId: this.socket.id },
      playerId => playerId !== this.socket.id
    );

  private gameToResponse = (game: Game) => ({ id: game.id, bestOf: game.bestOf, playerIds: game.getPlayerIds() });
}
