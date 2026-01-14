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
 * Determine the winner of a set or match based on scores
 */
export function getWinner(
  score1: number,
  score2: number,
): 'player1' | 'player2' | null {
  if (score1 > score2) return 'player1'
  if (score2 > score1) return 'player2'
  return null
}

export type SetScore = {
  score1: number
  score2: number
}

/**
 * Validate a multi-set match
 * @param matchFormat - Best of 1, 3, or 5 sets
 * @param setScores - Array of set scores
 */
export function validateMatch(
  matchFormat: number,
  setScores: SetScore[],
): { valid: boolean; error?: string; setsWon1?: number; setsWon2?: number } {
  // Validate match format
  if (![1, 3, 5].includes(matchFormat)) {
    return { valid: false, error: 'Matchformat måste vara 1, 3 eller 5 set' }
  }

  const setsToWin = Math.ceil(matchFormat / 2)

  if (setScores.length === 0) {
    return { valid: false, error: 'Inga set har registrerats' }
  }

  // Validate each set
  let setsWon1 = 0
  let setsWon2 = 0

  for (let i = 0; i < setScores.length; i++) {
    const set = setScores[i]
    const setValidation = validatePingPongScore(set.score1, set.score2)
    if (!setValidation.valid) {
      return { valid: false, error: `Set ${i + 1}: ${setValidation.error}` }
    }

    if (set.score1 > set.score2) {
      setsWon1++
    } else {
      setsWon2++
    }

    // Check if match is already decided
    if (setsWon1 === setsToWin || setsWon2 === setsToWin) {
      // This should be the last set
      if (i !== setScores.length - 1) {
        return {
          valid: false,
          error: 'Matchen fortsatte efter att en spelare redan vunnit',
        }
      }
    }
  }

  // Verify someone won the match
  if (setsWon1 !== setsToWin && setsWon2 !== setsToWin) {
    return {
      valid: false,
      error: `Ingen spelare har vunnit ${setsToWin} set än`,
    }
  }

  return { valid: true, setsWon1, setsWon2 }
}

/**
 * Get the winner of a multi-set match
 */
export function getMatchWinner(
  setScores: SetScore[],
): 'player1' | 'player2' | null {
  let setsWon1 = 0
  let setsWon2 = 0

  for (const set of setScores) {
    if (set.score1 > set.score2) {
      setsWon1++
    } else if (set.score2 > set.score1) {
      setsWon2++
    }
  }

  if (setsWon1 > setsWon2) return 'player1'
  if (setsWon2 > setsWon1) return 'player2'
  return null
}

/**
 * Validate set counts for a match (simplified scoring without detailed set scores)
 * @param matchFormat - Best of 1, 3, or 5 sets
 * @param setsWon1 - Sets won by player 1
 * @param setsWon2 - Sets won by player 2
 */
export function validateSetCounts(
  matchFormat: number,
  setsWon1: number,
  setsWon2: number,
): { valid: boolean; error?: string } {
  // Validate match format
  if (![1, 3, 5].includes(matchFormat)) {
    return { valid: false, error: 'Matchformat måste vara 1, 3 eller 5 set' }
  }

  // Validate set counts are integers
  if (!Number.isInteger(setsWon1) || !Number.isInteger(setsWon2)) {
    return { valid: false, error: 'Setresultat måste vara heltal' }
  }

  // Validate non-negative
  if (setsWon1 < 0 || setsWon2 < 0) {
    return { valid: false, error: 'Setresultat kan inte vara negativa' }
  }

  const setsToWin = Math.ceil(matchFormat / 2)

  // Validate one player has won
  if (setsWon1 !== setsToWin && setsWon2 !== setsToWin) {
    return { valid: false, error: `En spelare måste ha vunnit ${setsToWin} set` }
  }

  // Validate both players haven't won
  if (setsWon1 === setsToWin && setsWon2 === setsToWin) {
    return { valid: false, error: 'Båda spelarna kan inte vinna matchen' }
  }

  // Validate loser hasn't won too many sets
  const loserSets = Math.min(setsWon1, setsWon2)
  if (loserSets >= setsToWin) {
    return { valid: false, error: 'Ogiltigt setresultat' }
  }

  // Validate total sets doesn't exceed maximum
  const totalSets = setsWon1 + setsWon2
  if (totalSets > matchFormat) {
    return { valid: false, error: 'För många set för matchformatet' }
  }

  return { valid: true }
}

