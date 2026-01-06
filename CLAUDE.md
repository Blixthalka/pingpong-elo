# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev              # Start dev server on port 3000
pnpm build            # Build for production (output in .output/)

# Database
pnpm db:start         # Start PostgreSQL container
pnpm db:stop          # Stop PostgreSQL container
pnpm db:reset         # Reset database (removes all data)

# Testing & Quality
pnpm test             # Run tests with Vitest
pnpm lint             # Run ESLint
pnpm format           # Run Prettier
pnpm check            # Format and lint fix
```

## Architecture

This is a TanStack Start (React meta-framework) application for tracking ping pong ELO ratings.

### Stack
- **Framework**: TanStack Start with TanStack Router (file-based routing)
- **Database**: PostgreSQL via `postgres.js` (connection in `src/lib/db.ts`)
- **Styling**: Tailwind CSS v4 + Shadcn UI components
- **Build**: Vite + Nitro for SSR

### Key Patterns

**Server Functions**: API endpoints are defined using `createServerFn` from TanStack Start in `src/routes/api.pingpong.ts`. These are type-safe RPC-style functions called directly from React components.

**Database Layer**: `src/lib/db.ts` exports a `db` object with methods for all database operations. Schema is auto-created on startup. Types `Player`, `Match`, and `MatchWithNames` are exported from here.

**Business Logic**:
- `src/lib/elo.ts` - ELO calculation (K-factor 32, base rating 1000)
- `src/lib/rules.ts` - Ping pong score validation (11 points, win by 2)

**Routes**: File-based routing in `src/routes/`. Route tree is auto-generated in `src/routeTree.gen.ts`.

### Adding Shadcn Components

```bash
pnpx shadcn@latest add <component>
```

## Notes

- Error messages in the codebase are in Swedish
- Database connection requires `DATABASE_URL` environment variable
