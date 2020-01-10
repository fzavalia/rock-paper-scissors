import Game from "./Game";
import HasPlayers from "./interfaces/HasPlayers";
import HasLastInteraction from "./interfaces/HasLastInteraction";

export default class Lobby implements HasPlayers, HasLastInteraction {
  private readonly playerIds = new Set<string>();

  constructor(readonly id: string, readonly goal: number, public _lastInteraction: Date = new Date()) {}

  get lastInteraction() {
    return this._lastInteraction;
  }

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
    this._lastInteraction = new Date();
  };

  toGame = () => {
    if (!this.isFull()) {
      throw new Error("Missing players");
    }
    const playerIds = this.playerIds.values();
    return new Game(this.id, this.goal, playerIds.next().value, playerIds.next().value);
  };

  toJSONForPlayer = (playerId: string) => {
    if (!this.hasPlayer(playerId)) {
      throw new Error("Player not in Lobby");
    }
    const opponentId = this.getPlayerIds().filter(pid => pid !== playerId)[0];
    return {
      id: this.id,
      playerId,
      opponentId,
      isEmpty: this.isEmpty(),
      isFull: this.isFull()
    };
  };

  toJSON = () => {
    return {
      id: this.id
    };
  };

  remove = (playerId: string) => this.playerIds.delete(playerId);

  isEmpty = () => this.getPlayerIds().length === 0;

  isFull = () => this.getPlayerIds().length === 2;
}
