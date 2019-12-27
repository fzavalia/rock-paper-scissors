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

export default class Hand {
  static fromString = (str: string) => {
    if (str !== HandType.ROCK && str !== HandType.PAPER && str !== HandType.SCISSORS) {
      throw new Error("Invalid hand");
    }
    return new Hand(str);
  };

  constructor(readonly value: HandType) {}

  testAgainst = (hand: Hand): HandComparison => {
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
