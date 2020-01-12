import Game from "./Game";
import HasPlayers from "./interfaces/HasPlayers";
import HasLastInteraction from "./interfaces/HasLastInteraction";

export default class Lobby implements HasPlayers, HasLastInteraction {
  private readonly playerIds = new Set<string>();
  private readonly readyIds = new Set<string>();

  constructor(readonly id: string, private _goal: number, private _lastInteraction: Date = new Date()) {}

  get lastInteraction() {
    return this._lastInteraction;
  }

  get goal() {
    return this._goal;
  }

  set goal(value: number) {
    if (value < 1) {
      throw new Error("Goal must be > 1");
    }
    this._goal = value;
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

  setReady = (playerId: string, value: boolean) => {
    if (!this.playerIds.has(playerId)) {
      throw new Error("Player not in Lobby");
    }
    if (value) {
      this.readyIds.add(playerId);
    } else {
      this.readyIds.delete(playerId);
    }
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
      isFull: this.isFull(),
      goal: this._goal
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
