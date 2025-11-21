# Ping Pong ELO Tracker

A full-stack office ping pong tournament tracker with ELO rankings built with TanStack Start, React, and SQLite.

## Features

- **ELO Rating System**: Standard ELO calculation with K-factor of 32
- **Match Registration**: Enforce standard ping pong rules (11 points, win by 2)
- **Leaderboard Dashboard**: Real-time rankings with win/loss statistics
- **Player Management**: Add new contestants to the tournament
- **Match History**: View recent matches with ELO changes
- **PostgreSQL Database**: Persistent storage with Docker Compose for local development

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Docker and Docker Compose

### Local Development Setup

1. **Install dependencies:**

```bash
pnpm install
```

2. **Set up environment variables:**

Copy `.env.example` to `.env` (already done for local development):

```bash
cp .env.example .env
```

The default connection string is:
```
DATABASE_URL=postgres://pingpong:pingpong_dev_password@localhost:5432/pingpong_elo
```

3. **Start the PostgreSQL database:**

```bash
pnpm db:start
```

This will start a PostgreSQL container on port 5432.

4. **Start the development server:**

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

### Database Management Scripts

```bash
# Start the database
pnpm db:start

# Stop the database
pnpm db:stop

# Reset the database (removes all data)
pnpm db:reset
```

## Application Structure

### Core Components

- **Dashboard** (`/`): Displays leaderboard and recent matches
- **Register Match** (`/matches/new`): Form to record match results
- **Add Player** (`/players/new`): Form to add new contestants

### Technical Implementation

- **Database** (`src/lib/db.ts`): PostgreSQL schema and connection using postgres.js
- **ELO Logic** (`src/lib/elo.ts`): Standard ELO calculation algorithm
- **Game Rules** (`src/lib/rules.ts`): Ping pong rule validation
- **Server Functions** (`src/routes/api.pingpong.ts`): Type-safe server endpoints
- **Docker Compose** (`docker-compose.yml`): PostgreSQL container for local development

### Ping Pong Rules

Matches are validated according to standard ping pong rules:
- Winner must score at least 11 points
- Winner must win by at least 2 points
- No ties allowed

### ELO System

- New players start at 1500 ELO
- K-factor of 32 (standard for competitive games)
- Ratings update automatically after each match
- Win/loss records tracked alongside ELO

# Building For Production

## Option 1: Build Locally

To build this application for production:

```bash
pnpm build
```

The built files will be in the `.output` directory.

## Option 2: Docker Deployment

### Build the Docker Image

```bash
docker build -t pingpong-elo .
```

### Run with Docker Compose (Recommended)

1. **Create a production environment file:**

```bash
cp .env.prod.example .env.prod
```

Edit `.env.prod` and set a secure password for `POSTGRES_PASSWORD`.

2. **Start the application:**

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

This will start both the PostgreSQL database and the application.

3. **View logs:**

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

4. **Stop the application:**

```bash
docker-compose -f docker-compose.prod.yml down
```

### Run Docker Image Manually

If you prefer to run the Docker image without Docker Compose:

```bash
# Run PostgreSQL
docker run -d \
  --name pingpong-postgres \
  -e POSTGRES_USER=pingpong \
  -e POSTGRES_PASSWORD=your_secure_password \
  -e POSTGRES_DB=pingpong_elo \
  -v pingpong_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:16-alpine

# Run the application
docker run -d \
  --name pingpong-app \
  -e DATABASE_URL=postgres://pingpong:your_secure_password@host.docker.internal:5432/pingpong_elo \
  -p 3000:3000 \
  pingpong-elo
```

## Deployment to Cloud Platforms

### Environment Variables Required

For any deployment, make sure to set:

- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Set to `production`

### Deploy to Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch app (follow prompts)
fly launch

# Create PostgreSQL database
fly postgres create

# Connect app to database
fly postgres attach <postgres-app-name>

# Deploy
fly deploy
```

### Deploy to Railway

1. Connect your GitHub repository to Railway
2. Add a PostgreSQL database from Railway's marketplace
3. Railway will automatically set `DATABASE_URL`
4. Deploy!

### Deploy to Render

1. Create a new Web Service from your repository
2. Add a PostgreSQL database
3. Set the `DATABASE_URL` environment variable
4. Build command: `pnpm install && pnpm build`
5. Start command: `node .output/server/index.mjs`

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```bash
pnpm test
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.


## Linting & Formatting


This project uses [eslint](https://eslint.org/) and [prettier](https://prettier.io/) for linting and formatting. Eslint is configured using [tanstack/eslint-config](https://tanstack.com/config/latest/docs/eslint). The following scripts are available:

```bash
pnpm lint
pnpm format
pnpm check
```


## Shadcn

Add components using the latest version of [Shadcn](https://ui.shadcn.com/).

```bash
pnpx shadcn@latest add button
```
