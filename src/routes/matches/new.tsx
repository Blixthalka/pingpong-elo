import { createFileRoute, useRouter, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { Swords, ArrowLeft, Info, Plus, Minus } from 'lucide-react'
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

type SetScore = {
  score1: string
  score2: string
}

function RegisterMatch() {
  const router = useRouter()
  const { players } = Route.useLoaderData()

  const [player1Id, setPlayer1Id] = useState<string>('')
  const [player2Id, setPlayer2Id] = useState<string>('')
  const [matchFormat, setMatchFormat] = useState<string>('1')
  const [setScores, setSetScores] = useState<SetScore[]>([{ score1: '', score2: '' }])
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const maxSets = parseInt(matchFormat, 10)
  const setsToWin = Math.ceil(maxSets / 2)

  // Calculate current sets won
  const { setsWon1, setsWon2, matchComplete } = useMemo(() => {
    let won1 = 0
    let won2 = 0

    for (const set of setScores) {
      const s1 = parseInt(set.score1, 10)
      const s2 = parseInt(set.score2, 10)
      if (!isNaN(s1) && !isNaN(s2) && s1 !== s2) {
        if (s1 > s2) won1++
        else won2++
      }
    }

    return {
      setsWon1: won1,
      setsWon2: won2,
      matchComplete: won1 >= setsToWin || won2 >= setsToWin,
    }
  }, [setScores, setsToWin])

  const handleMatchFormatChange = (value: string) => {
    setMatchFormat(value)
    // Reset set scores when format changes
    setSetScores([{ score1: '', score2: '' }])
  }

  const handleSetScoreChange = (index: number, field: 'score1' | 'score2', value: string) => {
    const newScores = [...setScores]
    newScores[index] = { ...newScores[index], [field]: value }
    setSetScores(newScores)
  }

  const addSet = () => {
    if (setScores.length < maxSets && !matchComplete) {
      setSetScores([...setScores, { score1: '', score2: '' }])
    }
  }

  const removeSet = (index: number) => {
    if (setScores.length > 1) {
      setSetScores(setScores.filter((_, i) => i !== index))
    }
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

    // Convert set scores to numbers
    const parsedSetScores = setScores.map((set) => ({
      score1: parseInt(set.score1, 10),
      score2: parseInt(set.score2, 10),
    }))

    // Validate all sets have scores
    for (let i = 0; i < parsedSetScores.length; i++) {
      if (isNaN(parsedSetScores[i].score1) || isNaN(parsedSetScores[i].score2)) {
        setError(`Set ${i + 1}: Vänligen ange giltiga poäng`)
        return
      }
    }

    setIsSubmitting(true)

    try {
      await registerMatch({
        data: {
          player1_id: parseInt(player1Id, 10),
          player2_id: parseInt(player2Id, 10),
          match_format: parseInt(matchFormat, 10),
          set_scores: parsedSetScores,
        },
      })

      router.navigate({ to: '/' })
    } catch (err: any) {
      setError(err.message || 'Kunde inte registrera match')
    } finally {
      setIsSubmitting(false)
    }
  }

  const player1 = players.find((p) => p.id === parseInt(player1Id, 10))
  const player2 = players.find((p) => p.id === parseInt(player2Id, 10))

  const canAddSet = setScores.length < maxSets && !matchComplete

  return (
    <div className="min-h-screen bg-background">
      <div className="py-12 px-6 max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center text-link hover:text-[rgba(255,146,165,0.8)] mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tillbaka till Översikt
        </Link>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground flex items-center gap-2">
              <Swords className="w-6 h-6 text-link" />
              Registrera Match
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Player Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="player1" className="text-muted-foreground">
                    Spelare 1
                  </Label>
                  <Select value={player1Id} onValueChange={setPlayer1Id} disabled={isSubmitting}>
                    <SelectTrigger className="bg-input border-border text-foreground">
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
                    <p className="text-sm text-muted-foreground">
                      Nuvarande ELO: <span className="text-link font-semibold">{player1.elo}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="player2" className="text-muted-foreground">
                    Spelare 2
                  </Label>
                  <Select value={player2Id} onValueChange={setPlayer2Id} disabled={isSubmitting}>
                    <SelectTrigger className="bg-input border-border text-foreground">
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
                    <p className="text-sm text-muted-foreground">
                      Nuvarande ELO: <span className="text-link font-semibold">{player2.elo}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Match Format Selection */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Matchformat</Label>
                <Select value={matchFormat} onValueChange={handleMatchFormatChange} disabled={isSubmitting}>
                  <SelectTrigger className="bg-input border-border text-foreground">
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
                <p className="text-xs text-muted-foreground">
                  Första till {setsToWin} vunna set vinner matchen
                </p>
              </div>

              {/* Sets Won Display */}
              {(setsWon1 > 0 || setsWon2 > 0) && (
                <div className="p-4 bg-[rgba(255,146,165,0.1)] border border-[rgba(255,146,165,0.3)] rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold ${setsWon1 >= setsToWin ? 'text-positive' : 'text-foreground'}`}>
                      {player1?.name || 'Spelare 1'}: {setsWon1} set
                    </span>
                    <span className="text-muted-foreground">-</span>
                    <span className={`font-semibold ${setsWon2 >= setsToWin ? 'text-positive' : 'text-foreground'}`}>
                      {player2?.name || 'Spelare 2'}: {setsWon2} set
                    </span>
                  </div>
                  {matchComplete && (
                    <p className="text-center text-positive mt-2 font-semibold">
                      {setsWon1 >= setsToWin ? player1?.name : player2?.name} vinner matchen!
                    </p>
                  )}
                </div>
              )}

              {/* Set Scores */}
              <div className="space-y-4">
                <Label className="text-muted-foreground">Setresultat</Label>
                {setScores.map((set, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-muted-foreground text-sm w-16">Set {index + 1}</span>
                    <Input
                      type="number"
                      min="0"
                      value={set.score1}
                      onChange={(e) => handleSetScoreChange(index, 'score1', e.target.value)}
                      placeholder="0"
                      className="bg-input border-border text-foreground placeholder:text-[rgba(255,242,244,0.6)] w-20 text-center"
                      disabled={isSubmitting}
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                      type="number"
                      min="0"
                      value={set.score2}
                      onChange={(e) => handleSetScoreChange(index, 'score2', e.target.value)}
                      placeholder="0"
                      className="bg-input border-border text-foreground placeholder:text-[rgba(255,242,244,0.6)] w-20 text-center"
                      disabled={isSubmitting}
                    />
                    {setScores.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSet(index)}
                        disabled={isSubmitting}
                        className="text-negative hover:text-negative hover:bg-[rgba(255,71,103,0.1)]"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}

                {canAddSet && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSet}
                    disabled={isSubmitting}
                    className="border-border text-muted-foreground hover:bg-table-row-hover"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Lägg till set
                  </Button>
                )}
              </div>

              {error && (
                <div className="p-4 bg-[rgba(255,71,103,0.1)] border border-[rgba(255,71,103,0.5)] rounded-lg">
                  <p className="text-negative text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !player1Id || !player2Id || !matchComplete}
                  className="bg-primary hover:bg-[rgba(242,12,108,0.5)] flex-1"
                >
                  {isSubmitting ? 'Registrerar...' : 'Registrera Match'}
                </Button>
                <Link to="/">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-border text-muted-foreground hover:bg-table-row-hover"
                  >
                    Avbryt
                  </Button>
                </Link>
              </div>
            </form>

            <div className="mt-6 p-4 bg-[rgba(68,188,255,0.1)] border border-[rgba(68,188,255,0.5)] rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-[rgba(68,188,255,1)] flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <strong className="text-[rgba(68,188,255,1)]">Pingisregler:</strong>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Välj matchformat: bäst av 1, 3 eller 5 set</li>
                    <li>Vinnaren av varje set måste ha minst 11 poäng</li>
                    <li>Vinnaren av varje set måste vinna med minst 2 poäng</li>
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
