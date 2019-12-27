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

export class Round {
  private readonly hands: Map<string, Hand> = new Map();

  constructor(private player1Id: string, private player2Id: string) {}

  playHand = (playerId: string, hand: Hand) => {
    this.validate(playerId);
    if (this.hands.has(playerId)) {
      throw new Error("Player already player");
    }
    this.hands.set(playerId, hand);
  };

  getHand = (playerId: string) => {
    const hand = this.hands.get(playerId);
    if (!hand) {
      throw new Error("Player hasn't played yet");
    }
    return hand;
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

  getPlayerResult = (playerId: string) => {
    this.validate(playerId);
    const player1Hand = this.hands.get(this.player1Id);
    const player2Hand = this.hands.get(this.player2Id);
    if (!player1Hand || !player2Hand) {
      throw new Error("A player hasn't played yet");
    }
    const playerHand = playerId === this.player1Id ? player1Hand : player2Hand;
    const opponnentHand = playerHand === player1Hand ? player2Hand : player1Hand;
    return playerHand.compare(opponnentHand);
  };

  isOver = () => this.hands.has(this.player1Id) && this.hands.has(this.player2Id);

  private validate = (playerId: string) => {
    if (![this.player1Id, this.player2Id].includes(playerId)) {
      throw new Error("Player does not belong to round");
    }
  };
}

export class Game {
  private readonly rounds: Round[];

  constructor(
    private readonly id: string,
    private readonly bestOf: number,
    private readonly player1Id: string,
    private readonly player2Id: string
  ) {
    this.rounds = [new Round(player1Id, player2Id)];
  }

  getPlayerIds = () => [this.player1Id, this.player2Id];

  isRoundOver = () => this.getLastRound().isOver();

  getRoundWinner = () => this.getLastRound().getWinner();

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
    if (!this.getLastRound().isOver()) {
      throw new Error("Round is not over");
    }
    this.rounds.push(new Round(this.player1Id, this.player2Id));
  };

  private getNonTiedRoundsCount = () => this.rounds.filter(round => round.getWinner() !== undefined).length;

  private getLastRound = () => this.rounds[this.rounds.length - 1];
}
