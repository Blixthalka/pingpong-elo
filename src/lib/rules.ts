/**
 * Validate ping pong match scores according to standard rules
 * - Winner must have at least 11 points
 * - Winner must win by at least 2 points
 * - One player must win (no ties)
 */
export function validatePingPongScore(
  score1: number,
  score2: number,
): { valid: boolean; error?: string } {
  // Check for valid numbers
  if (!Number.isInteger(score1) || !Number.isInteger(score2)) {
    return { valid: false, error: 'Poängen måste vara heltal' }
  }

  // Check for negative scores
  if (score1 < 0 || score2 < 0) {
    return { valid: false, error: 'Poängen kan inte vara negativa' }
  }

  // Check for tie
  if (score1 === score2) {
    return { valid: false, error: 'Matchen kan inte sluta oavgjort' }
  }

  const winner_score = Math.max(score1, score2)
  const loser_score = Math.min(score1, score2)

  // Winner must have at least 11 points
  if (winner_score < 11) {
    return {
      valid: false,
      error: 'Vinnaren måste ha minst 11 poäng',
    }
  }

  // Winner must win by at least 2 points
  if (winner_score - loser_score < 2) {
    return {
      valid: false,
      error: 'Vinnaren måste vinna med minst 2 poäng',
    }
  }

  return { valid: true }
}

/**
 * Determine the winner of a match
 */
export function getWinner(
  score1: number,
  score2: number,
): 'player1' | 'player2' | null {
  if (score1 > score2) return 'player1'
  if (score2 > score1) return 'player2'
  return null
}

