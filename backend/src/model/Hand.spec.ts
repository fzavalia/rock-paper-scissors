import Hand, { HandType, HandComparison } from "./Hand";

const expectResult = (handType1: HandType, handType2: HandType, result: HandComparison) => {
  const hand1 = new Hand(handType1);
  const hand2 = new Hand(handType2);
  expect(hand1.testAgainst(hand2)).toBe(result);
};

const expectWin = (handType1: HandType, handType2: HandType) => expectResult(handType1, handType2, HandComparison.WIN);

const expectFromString = (str: string, handType: HandType) => expect(Hand.fromString(str).value).toBe(handType);

describe("Hand", () => {
  describe("testAgainst", () => {
    it("paper wins against rock", () => expectWin(HandType.PAPER, HandType.ROCK));
    it("scissors win against paper", () => expectWin(HandType.SCISSORS, HandType.PAPER));
    it("rock wins against scissors", () => expectWin(HandType.ROCK, HandType.SCISSORS));
    it("win result", () => expectResult(HandType.SCISSORS, HandType.PAPER, HandComparison.WIN));
    it("tie result", () => expectResult(HandType.SCISSORS, HandType.SCISSORS, HandComparison.TIE));
    it("lose result", () => expectResult(HandType.SCISSORS, HandType.ROCK, HandComparison.LOSE));
  });

  describe("fromString", () => {
    it("fails on wrong input", () => expect(() => Hand.fromString("invalid")).toThrow());
    it("from rock", () => expectFromString("rock", HandType.ROCK));
    it("from paper", () => expectFromString("paper", HandType.PAPER));
    it("from scissors", () => expectFromString("scissors", HandType.SCISSORS));
  });
});
