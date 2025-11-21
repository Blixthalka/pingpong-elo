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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <section className="relative py-12 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Trophy className="w-16 h-16 text-yellow-400" />
            <h1 className="text-5xl md:text-6xl font-black text-white">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Ping Pong
              </span>{' '}
              <span className="text-gray-300">ELO</span>
            </h1>
          </div>
          <p className="text-xl text-gray-300 mb-8">
            Topplista för Montrose Pingis World Ranking
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/matches/new">
              <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600">
                <Swords className="w-5 h-5 mr-2" />
                Registrera Match
              </Button>
            </Link>
            <Link to="/players/new">
              <Button size="lg" variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
                <Plus className="w-5 h-5 mr-2" />
                Lägg till Spelare
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-8 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Topplista
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-700/50">
                    <TableHead className="text-gray-300 w-16">Rank</TableHead>
                    <TableHead className="text-gray-300">Spelare</TableHead>
                    <TableHead className="text-gray-300 text-right">ELO</TableHead>
                    <TableHead className="text-gray-300 text-right">Vinster</TableHead>
                    <TableHead className="text-gray-300 text-right">Förluster</TableHead>
                    <TableHead className="text-gray-300 text-right">Vinstprocent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((player, index) => {
                    const totalGames = player.wins + player.losses
                    const winRate = totalGames > 0 ? ((player.wins / totalGames) * 100).toFixed(1) : '0.0'
                    return (
                      <TableRow key={player.id} className="border-slate-700 hover:bg-slate-700/30">
                        <TableCell className="font-medium text-white">
                          {index === 0 && '🥇'}
                          {index === 1 && '🥈'}
                          {index === 2 && '🥉'}
                          {index > 2 && `#${index + 1}`}
                        </TableCell>
                        <TableCell className="text-white font-semibold">{player.name}</TableCell>
                        <TableCell className="text-right text-cyan-400 font-bold">{player.elo}</TableCell>
                        <TableCell className="text-right text-green-400">{player.wins}</TableCell>
                        <TableCell className="text-right text-red-400">{player.losses}</TableCell>
                        <TableCell className="text-right text-gray-300">{winRate}%</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">Senaste Matcher</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMatches.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Inga matcher än</p>
                ) : (
                  recentMatches.map((match) => {
                    const winner = match.score1 > match.score2 ? match.player1_name : match.player2_name
                    const isPlayer1Winner = match.score1 > match.score2
                    return (
                      <div
                        key={match.id}
                        className="bg-slate-700/30 rounded-lg p-4 border border-slate-600"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className={`font-semibold ${isPlayer1Winner ? 'text-green-400' : 'text-gray-300'}`}>
                            {match.player1_name}
                          </span>
                          <span className="text-2xl font-bold text-white">
                            {match.score1} - {match.score2}
                          </span>
                          <span className={`font-semibold ${!isPlayer1Winner ? 'text-green-400' : 'text-gray-300'}`}>
                            {match.player2_name}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 text-center">
                          Vinnare: {winner}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>
                            {match.player1_elo_after > match.player1_elo_before ? '+' : ''}
                            {match.player1_elo_after - match.player1_elo_before} ELO
                          </span>
                          <span>
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
