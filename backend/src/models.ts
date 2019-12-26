export enum HandComparison {
  TIE,
  WIN,
  LOSE
}

export enum HandType {
  ROCK = "rock",
  PAPER = "paper",
  SCISSORS = "scissors"
}

export class Hand {
  static fromString = (str: string) => {
    if (str !== HandType.ROCK && str !== HandType.PAPER && str !== HandType.SCISSORS) {
      throw new Error("Invalid hand");
    }
    return new Hand(str);
  };

  constructor(readonly value: HandType) {}

  compare = (hand: Hand): HandComparison => {
    if (this.value === hand.value) {
      return HandComparison.TIE;
    }
    const beatMap = new Map([
      [HandType.ROCK, HandType.SCISSORS],
      [HandType.SCISSORS, HandType.PAPER],
      [HandType.PAPER, HandType.ROCK]
    ]);
    return beatMap.get(this.value) === hand.value ? HandComparison.WIN : HandComparison.LOSE;
  };
}

export interface Lobby {
  id: string;
  bestOf: number;
  playerIds: Set<string>;
}

export interface Round {
  hands: Map<string, Hand>;
}

export class Game {
  constructor(
    readonly id: string,
    readonly bestOf: number,
    readonly rounds: Round[],
    readonly player1Id: string,
    readonly player2Id: string
  ) {}

  getWins = () => {
    const wins = this.getPlayer1Results().reduce(
      (acc, next) => {
        if (next === HandComparison.WIN) {
          acc[0]++;
        } else if (next === HandComparison.LOSE) {
          acc[1]++;
        }
        return acc;
      },
      [0, 0]
    );
    return {
      total: wins[0] + wins[1],
      player1: wins[0],
      player2: wins[1]
    };
  };

  getPlayer1Results = () =>
    this.rounds
      .map(round => round.hands)
      .map(hands => {
        const player1Hand = hands.get(this.player1Id);
        const player2Hand = hands.get(this.player2Id);
        if (player1Hand && player2Hand) {
          return player1Hand.compare(player2Hand);
        }
      });

  bothPlayersPlayedLastHand = () => {
    const hands = this.rounds[this.rounds.length - 1].hands;
    return hands.has(this.player1Id) && hands.has(this.player2Id);
  };

  getLastRoundWinner = () => {
    const hands = this.rounds[this.rounds.length - 1].hands;
    const player1Hand = hands.get(this.player1Id);
    const player2Hand = hands.get(this.player2Id);
    if (player1Hand && player2Hand) {
      const comparison = player1Hand.compare(player2Hand);
      return comparison === HandComparison.WIN
        ? this.player1Id
        : comparison === HandComparison.LOSE
        ? this.player2Id
        : undefined;
    }
  }
}
