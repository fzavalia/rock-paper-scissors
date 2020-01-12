import HasPlayers from "./interfaces/HasPlayers";
import HasLastInteraction from "./interfaces/HasLastInteraction";

class LobbyPlayer {
  static makeOwner = (id: string) => new LobbyPlayer(id, true);
  isReady = false;
  constructor(readonly id: string, public isOwner: boolean = false) {}
}

export default class Lobby implements HasPlayers, HasLastInteraction {
  private readonly players = new Map<string, LobbyPlayer>();

  constructor(
    readonly id: string,
    private ownerId: string,
    private _goal: number,
    private _lastInteraction: Date = new Date()
  ) {
    this.players.set(ownerId, LobbyPlayer.makeOwner(ownerId));
  }

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

  getPlayerIds = () => Array.from(this.players.keys());

  getPlayers = () => Array.from(this.players.values());

  hasPlayer = (playerId: string) => this.players.has(playerId);

  join = (playerId: string) => {
    if (this.players.has(playerId)) {
      throw new Error("Player is already in Lobby");
    }
    if (this.isFull()) {
      throw new Error("Lobby is full");
    }
    this.players.set(playerId, new LobbyPlayer(playerId));
    this._lastInteraction = new Date();
  };

  setReady = (playerId: string, value: boolean) => {
    const player = this.players.get(playerId);
    if (!player) {
      throw new Error("Player not in Lobby");
    }
    player.isReady = value;
  };

  remove = (playerId: string) => {
    if (playerId === this.ownerId) {
      throw new Error("Cannot remove the Owner");
    }
    this.players.delete(playerId);
  };

  isFull = () => this.getPlayerIds().length === 2;

  playersAreReady = () => this.getPlayers().length === 2;
}
