import Game from "./Game";

export default class Lobby {
  private readonly playerIds = new Set<string>();

  constructor(readonly id: string, readonly bestOf: number) {}

  join = (playerId: string) => {
    if (this.playerIds.has(playerId)) {
      throw new Error("Player already in Lobby");
    }
    if (this.playerIds.size >= 2) {
      throw new Error("Lobby is full");
    }
    this.playerIds.add(playerId);
  };

  getPlayerIds = () => Array.from(this.playerIds);

  toGame = () => {
    if (this.playerIds.size < 2) {
      throw new Error("Missing players");
    }
    const playerIds = this.playerIds.values();
    return new Game(this.id, this.bestOf, playerIds.next().value, playerIds.next().value);
  };

  hasPlayer = (playerId: string) => this.playerIds.has(playerId);

  remove = (playerId: string) => this.playerIds.delete(playerId);

  isEmpty = () => this.getPlayerIds().length === 0;
}
