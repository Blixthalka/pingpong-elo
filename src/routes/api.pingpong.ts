import { createServerFn } from '@tanstack/react-start'
import { db, type Player, type MatchWithNames } from '../lib/db'
import { calculateElo } from '../lib/elo'
import { validateMatch, getMatchWinner, type SetScore } from '../lib/rules'

/**
 * Get all players sorted by ELO (leaderboard)
 */
export const getLeaderboard = createServerFn({
  method: 'GET',
}).handler(async () => {
  const players = await db.getPlayers()
  return players.sort((a, b) => b.elo - a.elo)
})

/**
 * Get all players (for dropdowns)
 */
export const getPlayers = createServerFn({
  method: 'GET',
}).handler(async () => {
  const players = await db.getPlayers()
  return players.sort((a, b) => a.name.localeCompare(b.name))
})

/**
 * Add a new player
 */
export const addPlayer = createServerFn({ method: 'POST' })
  .inputValidator((data: { name: string }) => data)
  .handler(async ({ data }) => {
    const { name } = data

    if (!name || name.trim().length === 0) {
      throw new Error('Spelarnamn krävs')
    }

    const player = await db.addPlayer(name.trim())
    return player
  })

/**
 * Register a match and update ELO ratings
 */
export const registerMatch = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      player1_id: number
      player2_id: number
      match_format: number
      set_scores: SetScore[]
    }) => data,
  )
  .handler(async ({ data }) => {
    const { player1_id, player2_id, match_format, set_scores } = data

    // Validate players are different
    if (player1_id === player2_id) {
      throw new Error('Spelarna måste vara olika')
    }

    // Validate match and sets
    const validation = validateMatch(match_format, set_scores)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    // Get current player data
    const player1 = await db.getPlayerById(player1_id)
    const player2 = await db.getPlayerById(player2_id)

    if (!player1 || !player2) {
      throw new Error('En eller båda spelarna hittades inte')
    }

    // Determine winner based on sets won
    const winner = getMatchWinner(set_scores)
    if (!winner) {
      throw new Error('Kunde inte avgöra vinnare')
    }

    // Calculate new ELO ratings (based on match win, not individual sets)
    const { winner_new_elo, loser_new_elo } =
      winner === 'player1'
        ? calculateElo(player1.elo, player2.elo)
        : calculateElo(player2.elo, player1.elo)

    const player1_new_elo = winner === 'player1' ? winner_new_elo : loser_new_elo
    const player2_new_elo = winner === 'player2' ? winner_new_elo : loser_new_elo

    // Insert match record with sets won as scores
    await db.addMatch({
      player1_id,
      player2_id,
      score1: validation.setsWon1!,
      score2: validation.setsWon2!,
      match_format,
      set_scores: JSON.stringify(set_scores),
      player1_elo_before: player1.elo,
      player2_elo_before: player2.elo,
      player1_elo_after: player1_new_elo,
      player2_elo_after: player2_new_elo,
    })

    // Update player 1
    await db.updatePlayer(player1_id, {
      elo: player1_new_elo,
      wins: player1.wins + (winner === 'player1' ? 1 : 0),
      losses: player1.losses + (winner === 'player1' ? 0 : 1),
    })

    // Update player 2
    await db.updatePlayer(player2_id, {
      elo: player2_new_elo,
      wins: player2.wins + (winner === 'player2' ? 1 : 0),
      losses: player2.losses + (winner === 'player2' ? 0 : 1),
    })

    return {
      success: true,
      player1_elo_change: player1_new_elo - player1.elo,
      player2_elo_change: player2_new_elo - player2.elo,
    }
  })

/**
 * Get recent matches
 */
export const getRecentMatches = createServerFn({
  method: 'GET',
}).handler(async () => {
  const matches = await db.getMatchesWithNames()
  return matches
})

/**
 * Get a player by ID
 */
export const getPlayerById = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const player = await db.getPlayerById(data.id)
    if (!player) {
      throw new Error('Spelaren hittades inte')
    }
    return player
  })

/**
 * Get all matches for a specific player
 */
export const getPlayerMatches = createServerFn({ method: 'GET' })
  .inputValidator((data: { playerId: number }) => data)
  .handler(async ({ data }) => {
    const matches = await db.getPlayerMatches(data.playerId)
    return matches
  })

