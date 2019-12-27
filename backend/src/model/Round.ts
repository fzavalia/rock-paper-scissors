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
    const comparison = this.getPlayerResult(this.player1Id);
    switch (comparison) {
      case HandComparison.TIE:
        return undefined;
      case HandComparison.WIN:
        return this.player1Id;
      default:
        return this.player2Id;
    }
  };

  isOver = () => this.hands.has(this.player1Id) && this.hands.has(this.player2Id);

  private getPlayerResult = (playerId: string) => {
    this.validatePlayerId(playerId);

    const player1Hand = this.hands.get(this.player1Id);
    const player2Hand = this.hands.get(this.player2Id);

    if (!player1Hand || !player2Hand) {
      throw new Error("A player hasn't played yet");
    }

    const playerHand = playerId === this.player1Id ? player1Hand : player2Hand;
    const opponentHand = playerHand === player1Hand ? player2Hand : player1Hand;

    return playerHand.testAgainst(opponentHand);
  };

  private validatePlayerId = (playerId: string) => {
    if (![this.player1Id, this.player2Id].includes(playerId)) {
      throw new Error("Player does not belong to round");
    }
  };
}
