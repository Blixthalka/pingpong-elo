/**
 * Calculate new ELO ratings for two players after a match
 * @param winner_elo - Current ELO of the winner
 * @param loser_elo - Current ELO of the loser
 * @param k_factor - K-factor (default 32 for standard chess/competitive games)
 * @returns Object with new ELO ratings for both players
 */
export function calculateElo(
  winner_elo: number,
  loser_elo: number,
  k_factor: number = 32,
): { winner_new_elo: number; loser_new_elo: number } {
  // Calculate expected scores
  const expected_winner = 1 / (1 + Math.pow(10, (loser_elo - winner_elo) / 400))
  const expected_loser = 1 / (1 + Math.pow(10, (winner_elo - loser_elo) / 400))

  // Calculate new ratings
  // Winner gets 1 point, loser gets 0 points
  const winner_new_elo = Math.round(winner_elo + k_factor * (1 - expected_winner))
  const loser_new_elo = Math.round(loser_elo + k_factor * (0 - expected_loser))

  return {
    winner_new_elo,
    loser_new_elo,
  }
}

