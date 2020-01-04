import Hand, { HandComparison } from "./Hand";

export default class Round {
  private readonly hands: Map<string, Hand> = new Map();

  constructor(private player1Id: string, private player2Id: string) {}

  playHand = (playerId: string, hand: Hand) => {
    this.validatePlayerId(playerId);
    if (this.hands.has(playerId)) {
      throw new Error("Player already player");
    }
    this.hands.set(playerId, hand);
  };

  getWinner = () => {
    switch (this.getPlayer1Result()) {
      case HandComparison.TIE:
        return undefined;
      case HandComparison.WIN:
        return this.player1Id;
      default:
        return this.player2Id;
    }
  };

  isOver = () => this.hands.has(this.player1Id) && this.hands.has(this.player2Id);

  toJSON = () => {
    return {
      [this.player1Id]: this.hands.get(this.player1Id)?.toString(),
      [this.player2Id]: this.hands.get(this.player2Id)?.toString(),
      isOver: this.isOver(),
      winner: this.isOver() ? this.getWinner() : undefined
    };
  };

  private getPlayer1Result = () => {
    const player1Hand = this.hands.get(this.player1Id);
    const player2Hand = this.hands.get(this.player2Id);
    if (!player1Hand || !player2Hand) {
      throw new Error("A player hasn't played yet");
    }
    return player1Hand.testAgainst(player2Hand);
  };

  private validatePlayerId = (playerId: string) => {
    if (![this.player1Id, this.player2Id].includes(playerId)) {
      throw new Error("Player does not belong to round");
    }
  };
}
