import { Link } from '@tanstack/react-router'

import { useState } from 'react'
import {
  Menu,
  X,
  Trophy,
  UserPlus,
  Swords,
} from 'lucide-react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <header className="p-4 flex items-center bg-card text-foreground shadow-lg border-b border-border">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 hover:bg-table-row-hover rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <h1 className="ml-4 text-xl font-semibold">
          <Link to="/" className="flex items-center gap-2">
            <Trophy className="text-link" size={28} />
            <span>Ping Pong ELO</span>
          </Link>
        </h1>
      </header>

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-sidebar text-sidebar-foreground shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <h2 className="text-xl font-bold">Navigering</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
            aria-label="Stäng meny"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-sidebar-accent transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-sidebar-primary hover:bg-[rgba(242,12,108,0.5)] transition-colors mb-2',
            }}
          >
            <Trophy size={20} />
            <span className="font-medium">Översikt</span>
          </Link>

          <Link
            to="/matches/new"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-sidebar-accent transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-sidebar-primary hover:bg-[rgba(242,12,108,0.5)] transition-colors mb-2',
            }}
          >
            <Swords size={20} />
            <span className="font-medium">Registrera Match</span>
          </Link>

          <Link
            to="/players/new"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-sidebar-accent transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-sidebar-primary hover:bg-[rgba(242,12,108,0.5)] transition-colors mb-2',
            }}
          >
            <UserPlus size={20} />
            <span className="font-medium">Lägg till Spelare</span>
          </Link>
        </nav>
      </aside>
    </>
  )
}
