import Round from "./Round";
import Hand, { HandType } from "./Hand";

const player1Id = "player1Id";
const player2Id = "player2Id";

describe("Round", () => {
  describe("playHand", () => {
    it("succeeds", () => {
      const round = new Round(player1Id, player2Id);
      round.playHand(player1Id, new Hand(HandType.ROCK));
      round.playHand(player2Id, new Hand(HandType.ROCK));
    });

    it("fails when the user does not belong to the round", () => {
      const round = new Round(player1Id, player2Id);
      expect(() => round.playHand("invalid", new Hand(HandType.ROCK))).toThrow();
    });

    it("fails when a player has already played", () => {
      const round = new Round(player1Id, player2Id);
      round.playHand(player1Id, new Hand(HandType.ROCK));
      expect(() => round.playHand(player1Id, new Hand(HandType.ROCK))).toThrow();
    });
  });

  describe("isOver", () => {
    it("returns true when both players have played", () => {
      const round = new Round(player1Id, player2Id);
      expect(round.isOver()).toBeFalsy();
      round.playHand(player1Id, new Hand(HandType.ROCK));
      expect(round.isOver()).toBeFalsy();
      round.playHand(player2Id, new Hand(HandType.ROCK));
      expect(round.isOver()).toBeTruthy();
    });
  });

  describe("getWinner", () => {
    it("returns undefined on tie", () => {
      const round = new Round(player1Id, player2Id);
      round.playHand(player1Id, new Hand(HandType.ROCK));
      round.playHand(player2Id, new Hand(HandType.ROCK));
      expect(round.getWinner()).toBeUndefined();
    });

    it("returns the winning player when not tie", () => {
      const round = new Round(player1Id, player2Id);
      round.playHand(player1Id, new Hand(HandType.PAPER));
      round.playHand(player2Id, new Hand(HandType.ROCK));
      expect(round.getWinner()).toBe(player1Id);
    });
  });
});
