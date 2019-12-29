import Game from "./Game";
import Hand, { HandType } from "./Hand";

const player1Id = "player1Id";
const player2Id = "player2Id";

const make1RoundGame = () => new Game("id", 1, player1Id, player2Id);
const make2RoundGame = () => new Game("id", 2, player1Id, player2Id);

const makePlayer1WinRound = (game: Game) => {
  game.playHand(player1Id, new Hand(HandType.PAPER));
  game.playHand(player2Id, new Hand(HandType.ROCK));
};

const makePlayer2WinRound = (game: Game) => {
  game.playHand(player1Id, new Hand(HandType.SCISSORS));
  game.playHand(player2Id, new Hand(HandType.ROCK));
};

const makePlayer1PlayHand = (game: Game) => game.playHand(player1Id, new Hand(HandType.SCISSORS));

describe("Game", () => {
  describe("getPlayerIds", () => {
    it("succeeds", () => {
      const game = make1RoundGame();
      expect(game.getPlayerIds()).toEqual([player1Id, player2Id]);
    });
  });

  describe("getRoundWinner", () => {
    it("fails when a player hasn't played yet", () => {
      const game = make1RoundGame();
      expect(() => game.getRoundWinner()).toThrow();
      makePlayer1PlayHand(game);
      expect(() => game.getRoundWinner()).toThrow();
    });

    it("succeeds", () => {
      const game = make1RoundGame();
      makePlayer1WinRound(game);
      expect(game.getRoundWinner()).toBe(player1Id);
    });
  });

  describe("getWinner", () => {
    it("succeeds", () => {
      const game = make1RoundGame();
      makePlayer1WinRound(game);
      expect(game.getWinner()).toBe(player1Id);
    });

    it("succeeds with other player", () => {
      const game = make1RoundGame();
      makePlayer2WinRound(game);
      expect(game.getWinner()).toBe(player2Id);
    });

    it("fails when all rounds haven't been played", () => {
      const game = make1RoundGame();
      expect(() => game.getWinner()).toThrow();
      makePlayer1PlayHand(game);
      expect(() => game.getWinner()).toThrow();
    });
  });

  describe("hasPlayer", () => {
    it("succeeds", () => {
      const game = make1RoundGame();
      expect(game.hasPlayer(player1Id)).toBeTruthy();
      expect(game.hasPlayer("other")).toBeFalsy();
    });
  });

  describe("isOver", () => {
    it("succeeds", () => {
      const game = make1RoundGame();
      expect(game.isOver()).toBeFalsy();
      makePlayer1WinRound(game);
      expect(game.isOver()).toBeTruthy();
    });
  });

  describe("isRoundOver", () => {
    it("succeeds", () => {
      const game = make1RoundGame();
      expect(game.isRoundOver()).toBeFalsy();
      makePlayer1WinRound(game);
      expect(game.isRoundOver()).toBeTruthy();
    });
  });

  describe("startNextRound", () => {
    it("succeeds", () => {
      const game = make2RoundGame();
      makePlayer1WinRound(game);
      game.startNextRound();
    });

    it("fails when round is not over", () => {
      const game = make1RoundGame();
      expect(() => game.startNextRound()).toThrow();
    });

    it("fails when game is over", () => {
      const game = make1RoundGame();
      makePlayer1WinRound(game);
      expect(() => game.startNextRound()).toThrow();
    });
  });
});
