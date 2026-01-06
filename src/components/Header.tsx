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
      <header className="px-4 py-3 flex items-center bg-card/80 backdrop-blur-sm text-foreground border-b border-[rgba(255,128,191,0.08)] sticky top-0 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 hover:bg-table-row-hover rounded transition-all duration-150 active:scale-95"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <h1 className="ml-3 text-lg font-bold tracking-tight">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <Trophy className="text-link" size={24} />
            <span>Ping Pong ELO</span>
          </Link>
        </h1>
      </header>

      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-card text-sidebar-foreground shadow-2xl z-50 transform transition-transform duration-200 ease-out flex flex-col border-r border-[rgba(255,128,191,0.08)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,128,191,0.08)]">
          <h2 className="text-base font-bold tracking-tight">Navigering</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-table-row-hover rounded transition-all duration-150 active:scale-95"
            aria-label="Stäng meny"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded hover:bg-table-row-hover transition-all duration-150 mb-1 text-sm font-medium"
            activeProps={{
              className:
                'flex items-center gap-3 px-3 py-2.5 rounded bg-primary/80 hover:bg-primary transition-all duration-150 mb-1 text-sm font-medium',
            }}
          >
            <Trophy size={18} />
            <span>Översikt</span>
          </Link>

          <Link
            to="/matches/new"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded hover:bg-table-row-hover transition-all duration-150 mb-1 text-sm font-medium"
            activeProps={{
              className:
                'flex items-center gap-3 px-3 py-2.5 rounded bg-primary/80 hover:bg-primary transition-all duration-150 mb-1 text-sm font-medium',
            }}
          >
            <Swords size={18} />
            <span>Registrera Match</span>
          </Link>

          <Link
            to="/players/new"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded hover:bg-table-row-hover transition-all duration-150 mb-1 text-sm font-medium"
            activeProps={{
              className:
                'flex items-center gap-3 px-3 py-2.5 rounded bg-primary/80 hover:bg-primary transition-all duration-150 mb-1 text-sm font-medium',
            }}
          >
            <UserPlus size={18} />
            <span>Lägg till Spelare</span>
          </Link>
        </nav>
      </aside>
    </>
  )
}
