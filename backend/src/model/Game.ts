import Round from "./Round";
import Hand from "./Hand";
import HasPlayers from "./interfaces/HasPlayers";

export default class Game implements HasPlayers {
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
    if (this.getNonTiedRoundsCount() < this.bestOf) {
      throw new Error("Game not finished");
    }
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
    if (!this.isRoundOver()) {
      throw new Error("Round is not over");
    }
    if (this.isOver()) {
      throw new Error("Game is over");
    }
    this.rounds.push(new Round(this.player1Id, this.player2Id));
  };

  toJSONForPlayer = (playerId: string) => {
    if (!this.hasPlayer(playerId)) {
      throw new Error("Player is not in game");
    }
    const opponentId = this.player1Id !== playerId ? this.player1Id : this.player2Id;
    return {
      id: this.id,
      bestOf: this.bestOf,
      playerId,
      opponentId,
      rounds: this.rounds.map(r => r.toJSONForPlayer(playerId)),
      isOver: this.isOver(),
      isRoundOver: this.isRoundOver(),
      winner: this.isOver() ? this.getWinner() === playerId : undefined,
      playerScore: this.getPlayerScore(playerId),
      opponentScore: this.getPlayerScore(opponentId)
    };
  };

  private getNonTiedRoundsCount = () =>
    this.rounds.filter(round => {
      try {
        return round.getWinner() !== undefined;
      } catch (e) {
        return false;
      }
    }).length;

  private getPlayerScore = (playerId: string) =>
    this.rounds.filter(round => round.isOver()).filter(round => round.getWinner() === playerId).length;

  private getCurrentRound = () => this.rounds[this.rounds.length - 1];
}
