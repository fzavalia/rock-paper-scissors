import Game from "./Game";
import Hand, { HandType } from "./Hand";

const player1Id = "player1Id";
const player2Id = "player2Id";
const makeGame = () => new Game("id", 1, player1Id, player2Id);

describe("Game", () => {
  describe("getPlayerIds", () => {
    it("succeeds", () => {
      const game = makeGame();
      expect(game.getPlayerIds()).toEqual([player1Id, player2Id]);
    });
  });

  describe("getRoundWinner", () => {
    it("fails when a player hasn't played yet", () => {
      const game = makeGame();
      expect(() => game.getRoundWinner()).toThrow();
      game.playHand(player1Id, new Hand(HandType.PAPER));
      expect(() => game.getRoundWinner()).toThrow();
    });

    it("succeeds", () => {
      const game = makeGame();
      game.playHand(player1Id, new Hand(HandType.PAPER));
      game.playHand(player2Id, new Hand(HandType.ROCK));
      expect(game.getRoundWinner()).toBe(player1Id);
    });
  });

  describe("getWinner", () => {
    it("succeeds", () => {
      const game = makeGame();
      game.playHand(player1Id, new Hand(HandType.PAPER));
      game.playHand(player2Id, new Hand(HandType.ROCK));
      expect(game.getWinner());
    });
    it("fails when all rounds haven't been played", () => {
      const game = makeGame();
      expect(() => game.getWinner()).toThrow();
      game.playHand(player1Id, new Hand(HandType.PAPER));
      expect(() => game.getWinner()).toThrow();
    });
  });

  describe("hasPlayer", () => {
    it("succeeds", () => {
      const game = makeGame();
      expect(game.hasPlayer(player1Id)).toBeTruthy();
      expect(game.hasPlayer("other")).toBeFalsy();
    });
  });

  describe("isOver", () => {
    it("succeeds", () => {
      const game = makeGame();
      expect(game.isOver()).toBeFalsy();
      game.playHand(player1Id, new Hand(HandType.PAPER));
      game.playHand(player2Id, new Hand(HandType.ROCK));
      expect(game.isOver()).toBeTruthy();
    });
  });

  describe("isRoundOver", () => {
    it("succeeds", () => {
      const game = makeGame();
      expect(game.isRoundOver()).toBeFalsy();
      game.playHand(player1Id, new Hand(HandType.PAPER));
      game.playHand(player2Id, new Hand(HandType.ROCK));
      expect(game.isRoundOver()).toBeTruthy();
    });
  });
});
