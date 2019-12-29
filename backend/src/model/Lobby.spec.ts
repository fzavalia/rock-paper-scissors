import Lobby from "./Lobby";

const player1Id = "player1Id";
const player2Id = "player2Id";

describe("Lobby", () => {
  describe("isEmpty", () => {
    it("returns true when no one has joined", () => {
      const lobby = new Lobby("id", 1);
      expect(lobby.isEmpty()).toBeTruthy();
    });

    it("returns false when at least 1 person joins", () => {
      const lobby = new Lobby("id", 1);
      lobby.join(player1Id);
      expect(lobby.isEmpty()).toBeFalsy();
      lobby.join(player2Id);
      expect(lobby.isEmpty()).toBeFalsy();
    });
  });

  describe("join", () => {
    it("fails when the same player tries to join more than once", () => {
      const lobby = new Lobby("id", 1);
      lobby.join(player1Id);
      expect(() => lobby.join(player1Id)).toThrow();
    });

    it("fails when the lobby is full", () => {
      const lobby = new Lobby("id", 1);
      lobby.join(player1Id);
      lobby.join(player2Id);
      expect(() => lobby.join("player3Id")).toThrow();
    });
  });

  describe("hasPlayer", () => {
    it("true when player is in lobby", () => {
      const lobby = new Lobby("id", 1);
      lobby.join(player1Id);
      expect(lobby.hasPlayer(player1Id)).toBeTruthy();
    });

    it("true when player is not in lobby", () => {
      const lobby = new Lobby("id", 1);
      expect(lobby.hasPlayer(player1Id)).toBeFalsy();
    });
  });

  describe("toGame", () => {
    it("fails when lobby is not full", () => {
      const lobby = new Lobby("id", 1);
      expect(() => lobby.toGame()).toThrow();
    });

    it("returns a game with the players in the lobby and the same id as the lobby", () => {
      const lobby = new Lobby("id", 1);
      lobby.join(player1Id);
      lobby.join(player2Id);
      const game = lobby.toGame();
      expect(game.id).toBe(lobby.id);
      expect(game.player1Id).toBe(player1Id);
      expect(game.player2Id).toBe(player2Id);
    });
  });

  describe("remove", () => {
    it("removes the player from the lobby", () => {
      const lobby = new Lobby("id", 1);
      lobby.join(player1Id);
      expect(lobby.hasPlayer(player1Id)).toBeTruthy();
      lobby.remove(player1Id);
      expect(lobby.hasPlayer(player1Id)).toBeFalsy();
    });
  });
});
