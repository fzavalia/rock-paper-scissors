export type Hand = "rock" | "paper" | "scissors";

export interface Game {
  id: string;
  player1: string;
  player2?: string;
  player1hand?: Hand;
  player2hand?: Hand;
}
