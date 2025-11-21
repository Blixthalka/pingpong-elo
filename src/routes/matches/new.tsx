import { createFileRoute, useRouter, Link } from '@tanstack/react-router'
import { useState } from 'react'
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
  const [score1, setScore1] = useState('')
  const [score2, setScore2] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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

    const s1 = parseInt(score1, 10)
    const s2 = parseInt(score2, 10)

    if (isNaN(s1) || isNaN(s2)) {
      setError('Vänligen ange giltiga poäng')
      return
    }

    setIsSubmitting(true)

    try {
      await registerMatch({
        data: {
          player1_id: parseInt(player1Id, 10),
          player2_id: parseInt(player2Id, 10),
          score1: s1,
          score2: s2,
        },
      })

      // Show success message with ELO changes
      router.navigate({ to: '/' })
    } catch (err: any) {
      setError(err.message || 'Kunde inte registrera match')
    } finally {
      setIsSubmitting(false)
    }
  }

  const player1 = players.find((p) => p.id === parseInt(player1Id, 10))
  const player2 = players.find((p) => p.id === parseInt(player2Id, 10))

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

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="score1" className="text-muted-foreground">
                    Spelare 1 Poäng
                  </Label>
                  <Input
                    id="score1"
                    type="number"
                    min="0"
                    value={score1}
                    onChange={(e) => setScore1(e.target.value)}
                    placeholder="0"
                    className="bg-input border-border text-foreground placeholder:text-[rgba(255,242,244,0.6)]"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="score2" className="text-muted-foreground">
                    Spelare 2 Poäng
                  </Label>
                  <Input
                    id="score2"
                    type="number"
                    min="0"
                    value={score2}
                    onChange={(e) => setScore2(e.target.value)}
                    placeholder="0"
                    className="bg-input border-border text-foreground placeholder:text-[rgba(255,242,244,0.6)]"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-[rgba(255,71,103,0.1)] border border-[rgba(255,71,103,0.5)] rounded-lg">
                  <p className="text-negative text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !player1Id || !player2Id || !score1 || !score2}
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
                    <li>Välj din motståndare</li>
                    <li>Bäst av 1 eller 3 set</li>
                    <li>Vinnaren av setet måste ha minst 11 poäng</li>
                    <li>Vinnaren av setet måste vinna med minst 2 poäng</li>
                    <li>Matchen kan inte sluta oavgjort</li>
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

