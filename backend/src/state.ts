import { Socket } from "socket.io";

export type Hand = "rock" | "paper" | "scissors";

export interface Game {
  id: string;
  player1: string;
  player2?: string;
  player1hand?: Hand;
  player2hand?: Hand;
}

export const games: Map<string, Game> = new Map();

export const sockets: Map<string, Socket> = new Map();
