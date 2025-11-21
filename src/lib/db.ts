import initSqlJs, { Database as SqlJsDatabase } from 'sql.js'
import path from 'node:path'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'

const DB_PATH = path.join(process.cwd(), 'pingpong.db')

let dbInstance: SqlJsDatabase | null = null

async function getDB(): Promise<SqlJsDatabase> {
  if (dbInstance) {
    return dbInstance
  }

  const SQL = await initSqlJs()
  
  // Try to load existing database
  if (existsSync(DB_PATH)) {
    const buffer = await fs.readFile(DB_PATH)
    dbInstance = new SQL.Database(buffer)
  } else {
    dbInstance = new SQL.Database()
  }
  
  // Always ensure tables exist (CREATE TABLE IF NOT EXISTS is safe)
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      elo INTEGER NOT NULL DEFAULT 1500,
      wins INTEGER NOT NULL DEFAULT 0,
      losses INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player1_id INTEGER NOT NULL,
      player2_id INTEGER NOT NULL,
      score1 INTEGER NOT NULL,
      score2 INTEGER NOT NULL,
      player1_elo_before INTEGER NOT NULL,
      player2_elo_before INTEGER NOT NULL,
      player1_elo_after INTEGER NOT NULL,
      player2_elo_after INTEGER NOT NULL,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (player1_id) REFERENCES players(id),
      FOREIGN KEY (player2_id) REFERENCES players(id)
    );

    CREATE INDEX IF NOT EXISTS idx_matches_timestamp ON matches(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_players_elo ON players(elo DESC);
  `)
  
  // Optional: Seed initial data (comment out if you want to start empty)
  // const result = dbInstance.exec('SELECT COUNT(*) as count FROM players')
  // const count = result.length > 0 ? (result[0].values[0][0] as number) : 0
  
  // if (count === 0) {
  //   // Seed initial data
  //   const now = Date.now()
  //   dbInstance.run(
  //     'INSERT INTO players (name, elo, wins, losses, created_at) VALUES (?, 1500, 0, 0, ?)',
  //     ['Alice', now]
  //   )
  //   dbInstance.run(
  //     'INSERT INTO players (name, elo, wins, losses, created_at) VALUES (?, 1500, 0, 0, ?)',
  //     ['Bob', now]
  //   )
  //   dbInstance.run(
  //     'INSERT INTO players (name, elo, wins, losses, created_at) VALUES (?, 1500, 0, 0, ?)',
  //     ['Charlie', now]
  //   )
  //   dbInstance.run(
  //     'INSERT INTO players (name, elo, wins, losses, created_at) VALUES (?, 1500, 0, 0, ?)',
  //     ['Diana', now]
  //   )
  //   
  //   // Save initial database
  //   await saveDB(dbInstance)
  // }

  return dbInstance
}

async function saveDB(database: SqlJsDatabase): Promise<void> {
  const data = database.export()
  await fs.writeFile(DB_PATH, data)
}

export type Player = {
  id: number
  name: string
  elo: number
  wins: number
  losses: number
  created_at: number
}

export type Match = {
  id: number
  player1_id: number
  player2_id: number
  score1: number
  score2: number
  player1_elo_before: number
  player2_elo_before: number
  player1_elo_after: number
  player2_elo_after: number
  timestamp: number
}

export type MatchWithNames = Match & {
  player1_name: string
  player2_name: string
}

export const db = {
  async getPlayers(): Promise<Player[]> {
    const database = await getDB()
    const result = database.exec('SELECT * FROM players ORDER BY elo DESC')
    if (result.length === 0) return []
    
    const players: Player[] = result[0].values.map((row) => ({
      id: row[0] as number,
      name: row[1] as string,
      elo: row[2] as number,
      wins: row[3] as number,
      losses: row[4] as number,
      created_at: row[5] as number,
    }))
    return players
  },

  async getPlayerById(id: number): Promise<Player | undefined> {
    const database = await getDB()
    const result = database.exec('SELECT * FROM players WHERE id = ?', [id])
    if (result.length === 0 || result[0].values.length === 0) return undefined
    
    const row = result[0].values[0]
    return {
      id: row[0] as number,
      name: row[1] as string,
      elo: row[2] as number,
      wins: row[3] as number,
      losses: row[4] as number,
      created_at: row[5] as number,
    }
  },

  async addPlayer(name: string): Promise<Player> {
    const database = await getDB()
    
    // Check for duplicate name
    const existing = database.exec('SELECT id FROM players WHERE name = ?', [name])
    if (existing.length > 0 && existing[0].values.length > 0) {
      throw new Error('En spelare med detta namn finns redan')
    }

    const now = Date.now()
    database.run(
      'INSERT INTO players (name, elo, wins, losses, created_at) VALUES (?, 1500, 0, 0, ?)',
      [name, now]
    )
    
    await saveDB(database)
    
    const result = database.exec('SELECT * FROM players WHERE name = ?', [name])
    const row = result[0].values[0]
    return {
      id: row[0] as number,
      name: row[1] as string,
      elo: row[2] as number,
      wins: row[3] as number,
      losses: row[4] as number,
      created_at: row[5] as number,
    }
  },

  async updatePlayer(id: number, updates: Partial<Omit<Player, 'id'>>): Promise<void> {
    const database = await getDB()
    const sets: string[] = []
    const values: any[] = []
    
    if (updates.elo !== undefined) {
      sets.push('elo = ?')
      values.push(updates.elo)
    }
    if (updates.wins !== undefined) {
      sets.push('wins = ?')
      values.push(updates.wins)
    }
    if (updates.losses !== undefined) {
      sets.push('losses = ?')
      values.push(updates.losses)
    }
    
    if (sets.length > 0) {
      values.push(id)
      database.run(`UPDATE players SET ${sets.join(', ')} WHERE id = ?`, values)
      await saveDB(database)
    }
  },

  async getMatches(): Promise<Match[]> {
    const database = await getDB()
    const result = database.exec('SELECT * FROM matches ORDER BY timestamp DESC LIMIT 10')
    if (result.length === 0) return []
    
    const matches: Match[] = result[0].values.map((row) => ({
      id: row[0] as number,
      player1_id: row[1] as number,
      player2_id: row[2] as number,
      score1: row[3] as number,
      score2: row[4] as number,
      player1_elo_before: row[5] as number,
      player2_elo_before: row[6] as number,
      player1_elo_after: row[7] as number,
      player2_elo_after: row[8] as number,
      timestamp: row[9] as number,
    }))
    return matches
  },

  async getMatchesWithNames(): Promise<MatchWithNames[]> {
    const database = await getDB()
    const result = database.exec(`
      SELECT 
        m.*,
        p1.name as player1_name,
        p2.name as player2_name
      FROM matches m
      JOIN players p1 ON m.player1_id = p1.id
      JOIN players p2 ON m.player2_id = p2.id
      ORDER BY m.timestamp DESC
      LIMIT 10
    `)
    if (result.length === 0) return []
    
    const matches: MatchWithNames[] = result[0].values.map((row) => ({
      id: row[0] as number,
      player1_id: row[1] as number,
      player2_id: row[2] as number,
      score1: row[3] as number,
      score2: row[4] as number,
      player1_elo_before: row[5] as number,
      player2_elo_before: row[6] as number,
      player1_elo_after: row[7] as number,
      player2_elo_after: row[8] as number,
      timestamp: row[9] as number,
      player1_name: row[10] as string,
      player2_name: row[11] as string,
    }))
    return matches
  },

  async addMatch(match: Omit<Match, 'id' | 'timestamp'>): Promise<Match> {
    const database = await getDB()
    const now = Date.now()
    
    database.run(
      `INSERT INTO matches 
      (player1_id, player2_id, score1, score2, player1_elo_before, player2_elo_before, player1_elo_after, player2_elo_after, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        match.player1_id,
        match.player2_id,
        match.score1,
        match.score2,
        match.player1_elo_before,
        match.player2_elo_before,
        match.player1_elo_after,
        match.player2_elo_after,
        now,
      ]
    )
    
    await saveDB(database)
    
    const result = database.exec('SELECT * FROM matches ORDER BY id DESC LIMIT 1')
    const row = result[0].values[0]
    return {
      id: row[0] as number,
      player1_id: row[1] as number,
      player2_id: row[2] as number,
      score1: row[3] as number,
      score2: row[4] as number,
      player1_elo_before: row[5] as number,
      player2_elo_before: row[6] as number,
      player1_elo_after: row[7] as number,
      player2_elo_after: row[8] as number,
      timestamp: row[9] as number,
    }
  },
}

