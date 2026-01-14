import { createFileRoute, useRouter, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { Swords, ArrowLeft, Info } from 'lucide-react'
import { getPlayers, registerMatch } from '../api.pingpong'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'

export const Route = createFileRoute('/matches/new')({
  component: RegisterMatch,
  loader: async () => {
    const players = await getPlayers()
    return { players }
  },
})

function RegisterMatch() {
  const router = useRouter()
  const { players } = Route.useLoaderData()

  const [player1Id, setPlayer1Id] = useState<string>('')
  const [player2Id, setPlayer2Id] = useState<string>('')
  const [matchFormat, setMatchFormat] = useState<string>('1')
  // For Bo1 - point scores
  const [score1, setScore1] = useState<string>('')
  const [score2, setScore2] = useState<string>('')
  // For Bo3/Bo5 - set counts
  const [setsWon1, setSetsWon1] = useState<string>('')
  const [setsWon2, setSetsWon2] = useState<string>('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const maxSets = parseInt(matchFormat, 10)
  const setsToWin = Math.ceil(maxSets / 2)
  const isBo1 = maxSets === 1

  // Parse scores once for reuse
  const parsedScore1 = parseInt(score1, 10)
  const parsedScore2 = parseInt(score2, 10)
  const parsedSetsWon1 = parseInt(setsWon1, 10)
  const parsedSetsWon2 = parseInt(setsWon2, 10)

  // Check if match is complete
  const matchComplete = useMemo(() => {
    if (isBo1) {
      if (isNaN(parsedScore1) || isNaN(parsedScore2)) return false
      const winnerScore = Math.max(parsedScore1, parsedScore2)
      const loserScore = Math.min(parsedScore1, parsedScore2)
      return winnerScore >= 11 && winnerScore - loserScore >= 2
    }
    if (isNaN(parsedSetsWon1) || isNaN(parsedSetsWon2)) return false
    return parsedSetsWon1 === setsToWin || parsedSetsWon2 === setsToWin
  }, [isBo1, parsedScore1, parsedScore2, parsedSetsWon1, parsedSetsWon2, setsToWin])

  const handleMatchFormatChange = (value: string) => {
    setMatchFormat(value)
    // Reset scores when format changes
    setScore1('')
    setScore2('')
    setSetsWon1('')
    setSetsWon2('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!player1Id || !player2Id) {
      setError('Vänligen välj båda spelarna')
      return
    }

    if (player1Id === player2Id) {
      setError('Spelarna måste vara olika')
      return
    }

    setIsSubmitting(true)

    const p1Id = parseInt(player1Id, 10)
    const p2Id = parseInt(player2Id, 10)

    try {
      if (isBo1) {
        if (isNaN(parsedScore1) || isNaN(parsedScore2)) {
          setError('Vänligen ange giltiga poäng')
          setIsSubmitting(false)
          return
        }
        await registerMatch({
          data: {
            player1_id: p1Id,
            player2_id: p2Id,
            match_format: 1,
            set_score: { score1: parsedScore1, score2: parsedScore2 },
          },
        })
      } else {
        if (isNaN(parsedSetsWon1) || isNaN(parsedSetsWon2)) {
          setError('Vänligen ange giltiga setresultat')
          setIsSubmitting(false)
          return
        }
        await registerMatch({
          data: {
            player1_id: p1Id,
            player2_id: p2Id,
            match_format: maxSets,
            sets_won1: parsedSetsWon1,
            sets_won2: parsedSetsWon2,
          },
        })
      }

      router.navigate({ to: '/' })
    } catch (err: any) {
      setError(err.message || 'Kunde inte registrera match')
    } finally {
      setIsSubmitting(false)
    }
  }

  const player1NumericId = player1Id ? parseInt(player1Id, 10) : null
  const player2NumericId = player2Id ? parseInt(player2Id, 10) : null
  const player1 = players.find((p) => p.id === player1NumericId)
  const player2 = players.find((p) => p.id === player2NumericId)

  // Determine winner for display
  function getWinnerName(): string | undefined {
    if (!matchComplete) return undefined

    const player1Won = isBo1
      ? parsedScore1 > parsedScore2
      : parsedSetsWon1 === setsToWin

    return player1Won ? player1?.name : player2?.name
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="py-8 px-6 max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center text-link hover:text-link/70 transition-colors mb-5 text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Tillbaka till Översikt
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-foreground flex items-center gap-2 font-bold tracking-tight">
              <Swords className="w-5 h-5 text-link" />
              Registrera Match
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Player Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="player1" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    Spelare 1
                  </Label>
                  <Select value={player1Id} onValueChange={setPlayer1Id} disabled={isSubmitting}>
                    <SelectTrigger className="bg-input/40 border-[rgba(255,128,191,0.1)] text-foreground">
                      <SelectValue placeholder="Välj spelare 1" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {players.map((player) => (
                        <SelectItem
                          key={player.id}
                          value={player.id.toString()}
                          className="text-foreground hover:bg-table-row-hover"
                        >
                          {player.name} (ELO: {player.elo})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {player1 && (
                    <p className="text-xs text-muted-foreground">
                      Nuvarande ELO: <span className="text-link font-semibold tabular-nums">{player1.elo}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="player2" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    Spelare 2
                  </Label>
                  <Select value={player2Id} onValueChange={setPlayer2Id} disabled={isSubmitting}>
                    <SelectTrigger className="bg-input/40 border-[rgba(255,128,191,0.1)] text-foreground">
                      <SelectValue placeholder="Välj spelare 2" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {players.map((player) => (
                        <SelectItem
                          key={player.id}
                          value={player.id.toString()}
                          className="text-foreground hover:bg-table-row-hover"
                        >
                          {player.name} (ELO: {player.elo})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {player2 && (
                    <p className="text-xs text-muted-foreground">
                      Nuvarande ELO: <span className="text-link font-semibold tabular-nums">{player2.elo}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Match Format Selection */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Matchformat</Label>
                <Select value={matchFormat} onValueChange={handleMatchFormatChange} disabled={isSubmitting}>
                  <SelectTrigger className="bg-input/40 border-[rgba(255,128,191,0.1)] text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="1" className="text-foreground hover:bg-table-row-hover">
                      Bäst av 1 set
                    </SelectItem>
                    <SelectItem value="3" className="text-foreground hover:bg-table-row-hover">
                      Bäst av 3 set
                    </SelectItem>
                    <SelectItem value="5" className="text-foreground hover:bg-table-row-hover">
                      Bäst av 5 set
                    </SelectItem>
                  </SelectContent>
                </Select>
                {!isBo1 && (
                  <p className="text-xs text-muted-foreground">
                    Första till {setsToWin} vunna set vinner matchen
                  </p>
                )}
              </div>

              {/* Score Input */}
              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  {isBo1 ? 'Poängställning' : 'Setresultat'}
                </Label>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium">
                      {player1?.name || 'Spelare 1'}
                    </span>
                    {isBo1 ? (
                      <Input
                        type="number"
                        min="0"
                        value={score1}
                        onChange={(e) => setScore1(e.target.value)}
                        placeholder="0"
                        className="w-20 text-center text-2xl font-bold tabular-nums h-14"
                        disabled={isSubmitting}
                      />
                    ) : (
                      <Input
                        type="number"
                        min="0"
                        max={setsToWin}
                        value={setsWon1}
                        onChange={(e) => setSetsWon1(e.target.value)}
                        placeholder="0"
                        className="w-20 text-center text-2xl font-bold tabular-nums h-14"
                        disabled={isSubmitting}
                      />
                    )}
                  </div>
                  <span className="text-2xl text-muted-foreground font-bold mt-6">-</span>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium">
                      {player2?.name || 'Spelare 2'}
                    </span>
                    {isBo1 ? (
                      <Input
                        type="number"
                        min="0"
                        value={score2}
                        onChange={(e) => setScore2(e.target.value)}
                        placeholder="0"
                        className="w-20 text-center text-2xl font-bold tabular-nums h-14"
                        disabled={isSubmitting}
                      />
                    ) : (
                      <Input
                        type="number"
                        min="0"
                        max={setsToWin}
                        value={setsWon2}
                        onChange={(e) => setSetsWon2(e.target.value)}
                        placeholder="0"
                        className="w-20 text-center text-2xl font-bold tabular-nums h-14"
                        disabled={isSubmitting}
                      />
                    )}
                  </div>
                </div>
                {matchComplete && (
                  <p className="text-center text-positive font-semibold text-sm">
                    {getWinnerName()} vinner matchen!
                  </p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-negative/10 border border-negative/30 rounded">
                  <p className="text-negative text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || !player1Id || !player2Id || !matchComplete}
                  className="flex-1"
                >
                  {isSubmitting ? 'Registrerar...' : 'Registrera Match'}
                </Button>
                <Link to="/">
                  <Button type="button" variant="outline">
                    Avbryt
                  </Button>
                </Link>
              </div>
            </form>

            <div className="mt-5 p-3 bg-[rgba(68,188,255,0.08)] border border-[rgba(68,188,255,0.2)] rounded">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-[rgba(68,188,255,1)] flex-shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <strong className="text-[rgba(68,188,255,1)]">
                    {isBo1 ? 'Pingisregler:' : 'Tips:'}
                  </strong>
                  <ul className="mt-1.5 space-y-0.5 list-disc list-inside">
                    {isBo1 ? (
                      <>
                        <li>Vinnaren måste ha minst 11 poäng</li>
                        <li>Vinnaren måste vinna med minst 2 poäng</li>
                      </>
                    ) : (
                      <li>Ange hur många set varje spelare vann</li>
                    )}
                    <li>ELO räknas endast för hela matchens vinnare</li>
                    <li>Vinster mot en starkare spelare ger dig fler poäng</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}