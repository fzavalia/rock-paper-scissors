import Commands from "../commands";
import { Game } from "../models";

const gameId = "gid";
const player1 = "p1";
const player2 = "p2";
const player3 = "p3";

describe("commands", () => {
  describe("startGame", () => {
    it("creates a game for the player", () => {
      const games = new Map<string, Game>();
      const commands = new Commands(games);
      const game = commands.startGame(player1);
      expect(game.player1).toBe(player1);
      expect(games.size).toBe(1);
    });
  });

  describe("joinGame", () => {
    it("joins an existing game", () => {
      const games = new Map<string, Game>();
      games.set(gameId, { id: gameId, player1 });
      const commands = new Commands(games);
      const game = commands.joinGame(player2, gameId);
      expect(game?.player2).toBe(player2);
    });

    it("returns undefined if game does not exist", () => {
      const games = new Map<string, Game>();
      const commands = new Commands(games);
      const game = commands.joinGame(player1, gameId);
      expect(game).toBeUndefined();
    });

    it("returns undefined if the player already belongs to the game", () => {
      const games = new Map<string, Game>();
      games.set(gameId, { id: gameId, player1 });
      const commands = new Commands(games);
      const game = commands.joinGame(player1, gameId);
      expect(game).toBeUndefined();
    });

    it("returns undefined if the game is full", () => {
      const games = new Map<string, Game>();
      games.set(gameId, { id: gameId, player1, player2 });
      const commands = new Commands(games);
      const game = commands.joinGame(player3, gameId);
      expect(game).toBeUndefined();
    });
  });

  describe("playHand", () => {
    it("sets the chosen hand for the player", () => {
      const games = new Map<string, Game>();
      games.set(gameId, { id: gameId, player1, player2 });
      const commands = new Commands(games);
      const result = commands.playHand(player1, "rock");
      expect(result?.opponent).toBe(player2);
      expect(games.get(gameId)?.player1hand).toBe("rock");
    });

    it("returns undefined if the player has already played", () => {
      const games = new Map<string, Game>();
      games.set(gameId, { id: gameId, player1, player2 });
      const commands = new Commands(games);
      commands.playHand(player1, "rock");
      const result = commands.playHand(player1, "rock");
      expect(result).toBeUndefined();
      expect(games.get(gameId)?.player1hand).toBe("rock");
    });

    it("returns undefined if the player is not in a game", () => {
      const games = new Map<string, Game>();
      const commands = new Commands(games);
      const result = commands.playHand(player1, "rock");
      expect(result).toBeUndefined();
    });
  });

  describe("disconnect", () => {
    it("deletes the player game and returns the opoonent", () => {
      const games = new Map<string, Game>();
      games.set(gameId, { id: gameId, player1, player2 });
      const commands = new Commands(games);
      const opponent = commands.disconnect(player1);
      expect(opponent).toBe(player2);
      expect(games.size).toBe(0);
    });

    it("returns undefined if the player does not exist", () => {
      const games = new Map<string, Game>();
      games.set(gameId, { id: gameId, player1, player2 });
      const commands = new Commands(games);
      const opponent = commands.disconnect(player3);
      expect(opponent).toBeUndefined();
      expect(games.size).toBe(1);
    });
  });
});
