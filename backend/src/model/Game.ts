import Round from "./Round";
import Hand from "./Hand";
import HasPlayers from "./interfaces/HasPlayers";

export default class Game implements HasPlayers {
  private readonly rounds: Round[];

  constructor(readonly id: string, readonly goal: number, readonly player1Id: string, readonly player2Id: string) {
    this.rounds = [new Round(player1Id, player2Id)];
  }

  getPlayerIds = () => [this.player1Id, this.player2Id];

  hasPlayer = (playerId: string) => this.player1Id === playerId || this.player2Id === playerId;

  playHand = (playerId: string, hand: Hand) => {
    const currentRound = this.getCurrentRound();
    currentRound.playHand(playerId, hand);
    if (this.isRoundOver() && !this.isOver()) {
      this.rounds.push(new Round(this.player1Id, this.player2Id));
    }
  };

  isRoundOver = () => this.getCurrentRound().isOver();

  getRoundWinner = () => this.getCurrentRound().getWinner();

  isOver = () => this.goalReached();

  getWinner = () => {
    if (!this.goalReached()) {
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

  toJSONForPlayer = (playerId: string) => {
    if (!this.hasPlayer(playerId)) {
      throw new Error("Player is not in game");
    }
    const opponentId = this.player1Id !== playerId ? this.player1Id : this.player2Id;
    return {
      id: this.id,
      goal: this.goal,
      playerId,
      opponentId,
      rounds: this.rounds.map(r => r.toJSONForPlayer(playerId)),
      isOver: this.isOver(),
      isRoundOver: this.isRoundOver(),
      winner: this.isOver() ? this.getWinner() === playerId : undefined,
      playerScore: this.getPlayerScore(playerId),
      opponentScore: this.getPlayerScore(opponentId),
      hasToPlay: this.getCurrentRound().playerHasToPlay(playerId)
    };
  };

  private goalReached = () =>
    this.getPlayerScore(this.player1Id) >= this.goal || this.getPlayerScore(this.player2Id) >= this.goal;

  private getPlayerScore = (playerId: string) =>
    this.rounds.filter(round => round.isOver()).filter(round => round.getWinner() === playerId).length;

  private getCurrentRound = () => this.rounds[this.rounds.length - 1];
}
