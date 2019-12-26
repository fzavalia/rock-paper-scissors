import uuid from "uuid/v4";
import { Game, Hand, Lobby } from "./models";

export default class Commands {
  constructor(private lobbies: Map<string, Lobby>, private games: Map<string, Game>) {}

  createLobby = (bestOf: number) => {
    const id = uuid();
    const lobby: Lobby = { id, bestOf, playerIds: new Set<string>() };
    this.lobbies.set(id, lobby);
    return lobby;
  };

  joinLobby = (playerId: string, lobbyId: string) => {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      throw new Error("Lobby not found");
    }
    if (lobby.playerIds.size >= 2) {
      throw new Error("Lobby is full");
    }
    if (lobby.playerIds.has(playerId)) {
      throw new Error("Player already in lobby");
    }
    lobby.playerIds.add(playerId);
    return lobby;
  };

  createGame = (lobbyId: string) => {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      throw new Error("Lobby not found");
    }
    if (lobby.playerIds.size < 2) {
      throw new Error("Missing Players");
    }
    const playerIds = lobby.playerIds.values();
    const game: Game = new Game(
      lobby.id,
      lobby.bestOf,
      [{ hands: new Map() }],
      playerIds.next().value,
      playerIds.next().value
    );
    this.games.set(game.id, game);
    return game;
  };

  playHand = (gameId: string, playerId: string, hand: Hand) => {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error("Game not found");
    }
    const { player1Id, player2Id } = game;
    if (playerId !== player1Id && playerId !== player2Id) {
      throw new Error("Player is not in this game");
    }
    const { rounds } = game;
    const currentRound = rounds[rounds.length - 1];
    const { hands } = currentRound;
    if (hands.has(playerId)) {
      throw new Error("Player already played hand");
    }
    hands.set(playerId, hand);
    return game;
  };

  nextRound = (gameId: string) => {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error("Game not found");
    }
    const { rounds } = game;
    const last = rounds[rounds.length - 1];
    if (last.hands.size < 2) {
      throw new Error("A player has yet to play a hand");
    }
    rounds.push({ hands: new Map() });
    return game;
  };

  disconnect = (playerId: string) => {
    let game: Game | undefined;
    for (let g of Array.from(this.games.values())) {
      if (g.player1Id === playerId || g.player2Id === playerId) {
        game = g;
        break;
      }
    }
    if (game) {
      this.games.delete(game.id);
      return game;
    }
  };
}
