import Round from "./Round";
import Hand from "./Hand";

export default class Game {
  private readonly rounds: Round[];

  constructor(readonly id: string, readonly bestOf: number, readonly player1Id: string, readonly player2Id: string) {
    this.rounds = [new Round(player1Id, player2Id)];
  }

  getPlayerIds = () => [this.player1Id, this.player2Id];

  hasPlayer = (playerId: string) => this.player1Id === playerId || this.player2Id === playerId;

  playHand = (playerId: string, hand: Hand) => {
    const currentRound = this.getCurrentRound();
    currentRound.playHand(playerId, hand);
  };

  isRoundOver = () => this.getCurrentRound().isOver();

  getRoundWinner = () => this.getCurrentRound().getWinner();

  isOver = () => this.getNonTiedRoundsCount() >= this.bestOf;

  getWinner = () => {
    const [player1Wins, player2Wins] = this.rounds
      .map(round => round.getWinner())
      .reduce(
        (acc, winner) => {
          if (winner === this.player1Id) acc[0]++;
          else acc[1]++;
          return acc;
        },
        [0, 0]
      );
    return player1Wins > player2Wins ? this.player1Id : this.player2Id;
  };

  startNextRound = () => {
    if (!this.getCurrentRound().isOver()) {
      throw new Error("Round is not over");
    }
    this.rounds.push(new Round(this.player1Id, this.player2Id));
  };

  private getNonTiedRoundsCount = () => this.rounds.filter(round => round.getWinner() !== undefined).length;

  private getCurrentRound = () => this.rounds[this.rounds.length - 1];
}
