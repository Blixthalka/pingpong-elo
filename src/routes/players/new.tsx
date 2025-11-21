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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="py-12 px-6 max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tillbaka till Översikt
        </Link>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-cyan-400" />
              Lägg till Ny Spelare
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">
                  Spelarnamn
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ange spelarnamn"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-500"
                  disabled={isSubmitting}
                />
                {error && <p className="text-red-400 text-sm">{error}</p>}
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="bg-cyan-500 hover:bg-cyan-600 flex-1"
                >
                  {isSubmitting ? 'Lägger till...' : 'Lägg till Spelare'}
                </Button>
                <Link to="/">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-slate-600 text-gray-300 hover:bg-slate-700/50"
                  >
                    Avbryt
                  </Button>
                </Link>
              </div>
            </form>

            <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
              <p className="text-sm text-gray-400">
                <strong className="text-gray-300">OBS:</strong> Nya spelare börjar med en ELO-rating på 1500.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

