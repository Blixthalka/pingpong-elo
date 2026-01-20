import type { MatchWithNames } from './db'

export type NemesisResult = {
  opponentId: number
  opponentName: string
  wins: number
  losses: number
  totalMatches: number
  winRate: number
} | null

const MIN_MATCHES_FOR_NEMESIS = 3

export function calculateNemesis(
  playerId: number,
  matches: MatchWithNames[]
): NemesisResult {
  const opponentMap = new Map<
    number,
    {
      opponentId: number
      opponentName: string
      wins: number
      losses: number
    }
  >()

  for (const match of matches) {
    const isPlayer1 = match.player1_id === playerId
    const opponentId = isPlayer1 ? match.player2_id : match.player1_id
    const opponentName = isPlayer1 ? match.player2_name : match.player1_name
    const won =
      (isPlayer1 ? match.score1 : match.score2) >
      (isPlayer1 ? match.score2 : match.score1)

    if (!opponentMap.has(opponentId)) {
      opponentMap.set(opponentId, { opponentId, opponentName, wins: 0, losses: 0 })
    }
    const stats = opponentMap.get(opponentId)!
    won ? stats.wins++ : stats.losses++
  }

  let nemesis: NemesisResult = null
  let worstWinRate = Infinity

  for (const stats of opponentMap.values()) {
    const totalMatches = stats.wins + stats.losses
    if (totalMatches < MIN_MATCHES_FOR_NEMESIS) continue

    const winRate = (stats.wins / totalMatches) * 100
    if (winRate < worstWinRate) {
      worstWinRate = winRate
      nemesis = { ...stats, totalMatches, winRate }
    }
  }

  return nemesis
}
