import Game from "./Game";
import HasPlayers from "./interfaces/HasPlayers";

export default class Lobby implements HasPlayers {
  private player1Id?: string;
  private player2Id?: string;

  constructor(readonly id: string, readonly bestOf: number) {}

  getPlayerIds = () => {
    const playerIds: string[] = [];
    if (this.player1Id) {
      playerIds.push(this.player1Id);
    }
    if (this.player2Id) {
      playerIds.push(this.player2Id);
    }
    return playerIds;
  };

  hasPlayer = (playerId: string) => this.getPlayerIds().includes(playerId);

  join = (playerId: string) => {
    if (this.getPlayerIds().includes(playerId)) {
      return;
    }
    if (this.getPlayerIds().length >= 2) {
      throw new Error("Lobby is full");
    }
    if (!this.player1Id) {
      this.player1Id = playerId;
    } else {
      this.player2Id = playerId;
    }
  };

  toGame = () => {
    const player1Id = this.player1Id;
    const player2Id = this.player2Id;
    if (!player1Id || !player2Id) {
      throw new Error("Missing players");
    }
    return new Game(this.id, this.bestOf, player1Id, player2Id);
  };

  remove = (playerId: string) => {
    if (this.player1Id === playerId) {
      this.player1Id = undefined;
    }
    if (this.player2Id === playerId) {
      this.player2Id = undefined;
    }
  };

  isEmpty = () => this.getPlayerIds().length === 0;
}
