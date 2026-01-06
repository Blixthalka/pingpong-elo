import { createFileRoute, useRouter, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { UserPlus, ArrowLeft } from 'lucide-react'
import { addPlayer } from '../api.pingpong'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'

export const Route = createFileRoute('/players/new')({
  component: AddPlayer,
})

function AddPlayer() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Spelarnamn krävs')
      return
    }

    setIsSubmitting(true)

    try {
      await addPlayer({ data: { name: name.trim() } })
      router.navigate({ to: '/' })
    } catch (err: any) {
      setError(err.message || 'Kunde inte lägga till spelare')
    } finally {
      setIsSubmitting(false)
    }
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
              <UserPlus className="w-5 h-5 text-link" />
              Lägg till Ny Spelare
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  Spelarnamn
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ange spelarnamn"
                  disabled={isSubmitting}
                />
                {error && <p className="text-negative text-sm">{error}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="flex-1"
                >
                  {isSubmitting ? 'Lägger till...' : 'Lägg till Spelare'}
                </Button>
                <Link to="/">
                  <Button type="button" variant="outline">
                    Avbryt
                  </Button>
                </Link>
              </div>
            </form>

            <div className="mt-5 p-3 bg-table-row rounded border border-border/50">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">OBS:</strong> Nya spelare börjar med en ELO-rating på 1000.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

