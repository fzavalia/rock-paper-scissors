export type Hand = "rock" | "paper" | "scissors";

export type Type = "single" | "best3" | "best5";

export interface Lobby {
  id: string;
  gameType: Type;
  playerIds: Set<string>;
}

export interface Round {
  hands: Map<string, Hand>;
}

export interface Game {
  id: string;
  type: Type;
  rounds: Round[];
  player1Id: string;
  player2Id: string;
}
