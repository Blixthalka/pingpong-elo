import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, User, Trophy, TrendingUp, TrendingDown } from 'lucide-react'
import { getPlayerById, getPlayerMatches } from '../api.pingpong'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

export const Route = createFileRoute('/players/$id')({
  component: PlayerDetail,
  loader: async ({ params }) => {
    const playerId = parseInt(params.id, 10)
    const [player, matches] = await Promise.all([
      getPlayerById({ data: { id: playerId } }),
      getPlayerMatches({ data: { playerId } }),
    ])
    return { player, matches }
  },
})

function PlayerDetail() {
  const { player, matches } = Route.useLoaderData()

  const totalGames = player.wins + player.losses
  const winRate = totalGames > 0 ? ((player.wins / totalGames) * 100).toFixed(1) : '0.0'

  return (
    <div className="min-h-screen bg-background">
      <div className="py-12 px-6 max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center text-link hover:text-[rgba(255,146,165,0.8)] mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tillbaka till Översikt
        </Link>

        <Card className="bg-card border-border mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground flex items-center gap-2">
              <User className="w-6 h-6 text-link" />
              {player.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-table-row rounded-lg p-4 border border-border text-center">
                <div className="text-3xl font-bold text-link">{player.elo}</div>
                <div className="text-sm text-muted-foreground">ELO</div>
              </div>
              <div className="bg-table-row rounded-lg p-4 border border-border text-center">
                <div className="text-3xl font-bold text-positive">{player.wins}</div>
                <div className="text-sm text-muted-foreground">Vinster</div>
              </div>
              <div className="bg-table-row rounded-lg p-4 border border-border text-center">
                <div className="text-3xl font-bold text-negative">{player.losses}</div>
                <div className="text-sm text-muted-foreground">Förluster</div>
              </div>
              <div className="bg-table-row rounded-lg p-4 border border-border text-center">
                <div className="text-3xl font-bold text-foreground">{winRate}%</div>
                <div className="text-sm text-muted-foreground">Vinstprocent</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-xl text-foreground flex items-center gap-2">
              <Trophy className="w-5 h-5 text-link" />
              Matchhistorik
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {matches.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Inga matcher än</p>
              ) : (
                matches.map((match) => {
                  const isPlayer1 = match.player1_id === player.id
                  const playerScore = isPlayer1 ? match.score1 : match.score2
                  const opponentScore = isPlayer1 ? match.score2 : match.score1
                  const opponentName = isPlayer1 ? match.player2_name : match.player1_name
                  const playerEloBefore = isPlayer1 ? match.player1_elo_before : match.player2_elo_before
                  const playerEloAfter = isPlayer1 ? match.player1_elo_after : match.player2_elo_after
                  const eloChange = playerEloAfter - playerEloBefore
                  const won = playerScore > opponentScore
                  const setScores = match.set_scores
                    ? (JSON.parse(match.set_scores) as { score1: number; score2: number }[])
                    : null
                  const formatLabel =
                    match.match_format === 5 ? 'Bo5' : match.match_format === 3 ? 'Bo3' : 'Bo1'

                  return (
                    <div
                      key={match.id}
                      className="bg-table-row rounded-lg p-4 border border-border hover:bg-table-row-hover transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {won ? (
                            <TrendingUp className="w-5 h-5 text-positive" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-negative" />
                          )}
                          <div>
                            <div className="text-foreground font-semibold">
                              vs {opponentName}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className="bg-[rgba(255,146,165,0.2)] px-1.5 py-0.5 rounded text-xs">{formatLabel}</span>
                              {won ? 'Vinst' : 'Förlust'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-foreground">
                            {playerScore} - {opponentScore}
                          </div>
                          {setScores && setScores.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              ({setScores
                                .map((s) =>
                                  isPlayer1
                                    ? `${s.score1}-${s.score2}`
                                    : `${s.score2}-${s.score1}`
                                )
                                .join(', ')})
                            </div>
                          )}
                          <div className={`text-sm font-medium ${eloChange > 0 ? 'text-positive' : 'text-negative'}`}>
                            {eloChange > 0 ? '+' : ''}{eloChange} ELO
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
