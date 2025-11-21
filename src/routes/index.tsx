import { createFileRoute, Link } from '@tanstack/react-router'
import { Trophy, Plus, Swords } from 'lucide-react'
import { getLeaderboard, getRecentMatches } from './api.pingpong'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'

export const Route = createFileRoute('/')({
  component: Dashboard,
  loader: async () => {
    const [leaderboard, recentMatches] = await Promise.all([
      getLeaderboard(),
      getRecentMatches(),
    ])
    return { leaderboard, recentMatches }
  },
})

function Dashboard() {
  const { leaderboard, recentMatches } = Route.useLoaderData()

  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-12 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(229,34,116,0.05)] via-[rgba(255,146,165,0.05)] to-[rgba(190,25,91,0.05)]"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Trophy className="w-16 h-16 text-[rgba(255,146,165,1)]" />
            <h1 className="text-5xl md:text-6xl font-black text-foreground">
              <span className="bg-gradient-to-r from-[rgba(255,146,165,1)] to-[rgba(229,34,116,1)] bg-clip-text text-transparent">
                Ping Pong
              </span>{' '}
              <span className="text-muted-foreground">ELO</span>
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Topplista för Pingis World Ranking
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/matches/new">
              <Button size="lg" className="bg-primary hover:bg-[rgba(242,12,108,0.5)]">
                <Swords className="w-5 h-5 mr-2" />
                Registrera Match
              </Button>
            </Link>
            <Link to="/players/new">
              <Button size="lg" variant="outline" className="border-[rgba(255,146,165,0.3)] text-link hover:bg-secondary">
                <Plus className="w-5 h-5 mr-2" />
                Lägg till Spelare
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-8 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground flex items-center gap-2">
                <Trophy className="w-6 h-6 text-link" />
                Topplista
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-table-row-hover">
                    <TableHead className="text-muted-foreground w-16">Rank</TableHead>
                    <TableHead className="text-muted-foreground">Spelare</TableHead>
                    <TableHead className="text-muted-foreground text-right">ELO</TableHead>
                    <TableHead className="text-muted-foreground text-right">Vinster</TableHead>
                    <TableHead className="text-muted-foreground text-right">Förluster</TableHead>
                    <TableHead className="text-muted-foreground text-right">Vinstprocent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((player, index) => {
                    const totalGames = player.wins + player.losses
                    const winRate = totalGames > 0 ? ((player.wins / totalGames) * 100).toFixed(1) : '0.0'
                    return (
                      <TableRow key={player.id} className="border-border hover:bg-table-row-hover">
                        <TableCell className="font-medium text-foreground">
                          {index === 0 && '🥇'}
                          {index === 1 && '🥈'}
                          {index === 2 && '🥉'}
                          {index > 2 && `#${index + 1}`}
                        </TableCell>
                        <TableCell className="text-foreground font-semibold">{player.name}</TableCell>
                        <TableCell className="text-right text-link font-bold">{player.elo}</TableCell>
                        <TableCell className="text-right text-positive">{player.wins}</TableCell>
                        <TableCell className="text-right text-negative">{player.losses}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{winRate}%</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Senaste Matcher</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMatches.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Inga matcher än</p>
                ) : (
                  recentMatches.map((match) => {
                    const winner = match.score1 > match.score2 ? match.player1_name : match.player2_name
                    const isPlayer1Winner = match.score1 > match.score2
                    return (
                      <div
                        key={match.id}
                        className="bg-table-row rounded-lg p-4 border border-border hover:bg-table-row-hover transition-colors"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className={`font-semibold ${isPlayer1Winner ? 'text-positive' : 'text-muted-foreground'}`}>
                            {match.player1_name}
                          </span>
                          <span className="text-2xl font-bold text-foreground">
                            {match.score1} - {match.score2}
                          </span>
                          <span className={`font-semibold ${!isPlayer1Winner ? 'text-positive' : 'text-muted-foreground'}`}>
                            {match.player2_name}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground text-center">
                          Vinnare: {winner}
                        </div>
                        <div className="flex justify-between text-xs text-muted mt-2">
                          <span className={match.player1_elo_after > match.player1_elo_before ? 'text-positive' : 'text-negative'}>
                            {match.player1_elo_after > match.player1_elo_before ? '+' : ''}
                            {match.player1_elo_after - match.player1_elo_before} ELO
                          </span>
                          <span className={match.player2_elo_after > match.player2_elo_before ? 'text-positive' : 'text-negative'}>
                            {match.player2_elo_after > match.player2_elo_before ? '+' : ''}
                            {match.player2_elo_after - match.player2_elo_before} ELO
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
