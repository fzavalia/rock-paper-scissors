import uuid from "uuid/v4";
import { Game, Hand } from "./models";

export default class Commands {
  constructor(private games: Map<string, Game>) {}

  startGame = (playerId: string) => {
    const gameId = uuid();
    const game: Game = { id: gameId, player1: playerId };
    this.games.set(gameId, game);
    return game;
  };

  joinGame = (playerId: string, gameId: string) => {
    const game = this.games.get(gameId);
    if (game && !game.player2 && game.player1 !== playerId) {
      game.player2 = playerId;
      return game;
    }
  };

  playHand = (playerId: string, hand: Hand) => {
    const game = this.findGameWithPlayer(playerId);
    if (game && game.player2) {
      const { player1, player1hand, player2, player2hand } = game;
      if (player1 === playerId && !player1hand) {
        game.player1hand = hand;
        return { game, opponent: player2 };
      }
      if (player2 === playerId && !player2hand) {
        game.player2hand = hand;
        return { game, opponent: player1 };
      }
    }
  };

  disconnect = (playerId: string) => {
    const game = this.findGameWithPlayer(playerId);
    if (game) {
      const { player1, player2, id: gameId } = game;
      this.games.delete(gameId);
      if (player1 === playerId) return player2;
      if (player2 === playerId) return player1;
    }
  };

  private findGameWithPlayer = (playerId: string) => {
    for (let game of Array.from(this.games.values())) {
      if (game.player1 === playerId || game.player2 === playerId) {
        return game;
      }
    }
  };
}
