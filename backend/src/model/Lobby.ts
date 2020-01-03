import Game from "./Game";
import HasPlayers from "./interfaces/HasPlayers";

export default class Lobby implements HasPlayers {
  private readonly playerIds = new Set<string>();

  constructor(readonly id: string, readonly bestOf: number) {}

  getPlayerIds = () => Array.from(this.playerIds);

  hasPlayer = (playerId: string) => this.playerIds.has(playerId);

  join = (playerId: string) => {
    if (this.playerIds.has(playerId)) {
      return;
    }
    if (this.playerIds.size >= 2) {
      throw new Error("Lobby is full");
    }
    this.playerIds.add(playerId);
  };

  toGame = () => {
    if (this.playerIds.size < 2) {
      throw new Error("Missing players");
    }
    const playerIds = this.playerIds.values();
    return new Game(this.id, this.bestOf, playerIds.next().value, playerIds.next().value);
  };

  remove = (playerId: string) => this.playerIds.delete(playerId);

  isEmpty = () => this.getPlayerIds().length === 0;
}
