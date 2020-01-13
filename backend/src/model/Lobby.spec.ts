import Lobby from "./Lobby";

const player1Id = "player1Id";
const player2Id = "player2Id";

const makeLobby = () => new Lobby("id", player1Id);

describe("Lobby", () => {
  describe("join", () => {
    it("adds the player to the lobby", () => {
      const lobby = makeLobby();
      lobby.join(player2Id);
    });

    it("fails when a player that is in the lobby tries to rejoin", () => {
      const lobby = makeLobby();
      expect(() => lobby.join(player1Id)).toThrow();
    });

    it("fails when the lobby is full", () => {
      const lobby = makeLobby();
      lobby.join(player2Id);
      expect(() => lobby.join("player3Id")).toThrow();
    });
  });

  describe("hasPlayer", () => {
    it("true when player is in lobby", () => {
      const lobby = makeLobby();
      expect(lobby.hasPlayer(player1Id)).toBeTruthy();
    });

    it("false when player is not in lobby", () => {
      const lobby = makeLobby();
      expect(lobby.hasPlayer(player2Id)).toBeFalsy();
    });
  });

  describe("remove", () => {
    it("removes the player from the lobby", () => {
      const lobby = makeLobby();
      lobby.join(player2Id);
      expect(lobby.hasPlayer(player2Id)).toBeTruthy();
      lobby.remove(player2Id);
      expect(lobby.hasPlayer(player2Id)).toBeFalsy();
    });

    it("fails when removing the owner", () => {
      const lobby = makeLobby();
      expect(() => lobby.remove(player1Id)).toThrow();
    });
  });

  describe("setReady", () => {
    it("sets the value of ready for a player", () => {
      const lobby = makeLobby();
      lobby.setReady(player1Id, true);
      lobby.setReady(player1Id, false);
    });

    it("fails when player is not in lobby", () => {
      const lobby = makeLobby();
      expect(() => lobby.setReady(player2Id, true)).toThrow();
    });
  });

  describe("playersAreReady", () => {
    it("returns true when both players are ready", () => {
      const lobby = makeLobby();
      lobby.join(player2Id);
      lobby.setReady(player1Id, true);
      lobby.setReady(player2Id, true);
      expect(lobby.playersAreReady()).toBeTruthy();
    });

    it("returns false when not", () => {
      const lobby = makeLobby();
      expect(lobby.playersAreReady()).toBeFalsy();
      lobby.setReady(player1Id, true);
      expect(lobby.playersAreReady()).toBeFalsy();
    });
  });

  describe("goal", () => {
    it("returns the value", () => {
      const lobby = makeLobby();
      expect(lobby.goal).toBe(1);
    });

    it("sets the value", () => {
      const lobby = makeLobby();
      lobby.goal = 2;
      expect(lobby.goal).toBe(2);
    });

    it("fails when setting the value to something less than 1", () => {
      const lobby = makeLobby();
      expect(() => (lobby.goal = -1)).toThrow();
    });
  });

  describe("lastInteraction", () => {
    it("returns the value", () => {
      const lobby = makeLobby();
      expect(lobby.lastInteraction).toBeInstanceOf(Date);
    });
  });
});
