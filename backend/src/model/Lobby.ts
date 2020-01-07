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
    if (this.isFull()) {
      throw new Error("Lobby is full");
    }
    this.playerIds.add(playerId);
  };

  toGame = () => {
    if (!this.isFull()) {
      throw new Error("Missing players");
    }
    const playerIds = this.playerIds.values();
    return new Game(this.id, this.bestOf, playerIds.next().value, playerIds.next().value);
  };

  toJSONForPlayer = (playerId: string) => {
    if (!this.hasPlayer(playerId)) {
      throw new Error("Player not in Lobby");
    }
    const opponentId = this.getPlayerIds().filter(pid => pid !== playerId)[0];
    return {
      id: String,
      playerId,
      opponentId,
      isEmpty: this.isEmpty(),
      isFull: this.isFull()
    };
  };

  remove = (playerId: string) => this.playerIds.delete(playerId);

  isEmpty = () => this.getPlayerIds().length === 0;

  isFull = () => this.getPlayerIds().length === 2;
}
