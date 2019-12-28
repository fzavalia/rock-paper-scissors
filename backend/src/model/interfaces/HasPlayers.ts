export default interface HasPlayers {
  getPlayerIds: () => string[];
  hasPlayer: (playerId: string) => boolean;
}
