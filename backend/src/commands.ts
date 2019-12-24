import uuid from "uuid/v4";
import { Game, games, Hand } from "./state";

export const startGame = (playerId: string) => {
  const gameId = uuid();
  const game: Game = { id: gameId, player1: playerId };
  games.set(gameId, game);
  return game;
};

export const joinGame = (playerId: string, gameId: string) => {
  const game = games.get(gameId);
  if (game && !game.player2) {
    game.player2 = playerId;
    return game;
  }
};

export const playHand = (playerId: string, hand: Hand) => {
  const game = findGameWithPlayer(playerId);
  if (game && game.player2) {
    const { player1, player2 } = game;
    if (player1 === playerId) {
      game.player1hand = hand;
      return player2;
    }
    if (player2 === playerId) {
      game.player2hand = hand;
      return player1;
    }
  }
};

export const disconnect = (playerId: string) => {
  const game = findGameWithPlayer(playerId);
  if (game) {
    const { player1, player2, id: gameId } = game;
    games.delete(gameId);
    if (player1 === playerId) return player2;
    if (player2 === playerId) return player1;
  }
};

const findGameWithPlayer = (playerId: string) => {
  for (let gameId in games) {
    const game = games.get(gameId);
    if (game?.player1 === playerId || game?.player2 === playerId) {
      return game;
    }
  }
};
