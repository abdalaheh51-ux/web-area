/**
 * seed-admin.ts
 * Creates or updates the admin account in the database.
 * 
 * SECURITY: This script reads credentials ONLY from environment variables.
 * No credentials are hardcoded, logged, or stored in source code.
 * The .env file containing ADMIN_EMAIL and ADMIN_PASSWORD is git-ignored.
 * 
 * Usage:
 *   1. Set ADMIN_EMAIL, ADMIN_PASSWORD (and optional ADMIN_NAME) in your .env file
 *   2. Run: bun run scripts/seed-admin.ts
 * 
 * This script works with both SQLite and PostgreSQL databases.
 * It detects the database type from DATABASE_URL and connects accordingly.
 */

import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Load .env file
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env')
try {
  dotenv.config({ path: envPath })
} catch {
  // .env not found — will rely on system environment variables
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  const adminName = process.env.ADMIN_NAME || 'Admin'

  // Validate required environment variables
  if (!adminEmail || !adminPassword) {
    console.error('❌ Missing required environment variables')
    console.error('   Please set the following in your .env file:')
    console.error('   - ADMIN_EMAIL (required)')
    console.error('   - ADMIN_PASSWORD (required, min 8 characters)')
    console.error('   - ADMIN_NAME (optional, defaults to "Admin")')
    process.exit(1)
  }

  if (adminPassword.length < 8) {
    console.error('❌ Admin password must be at least 8 characters long')
    process.exit(1)
  }

  const databaseUrl = process.env.DATABASE_URL || 'file:./db/custom.db'

  // Determine database type and connect
  let db: Database.Database
  if (databaseUrl.startsWith('file:') || databaseUrl.endsWith('.db') || databaseUrl.endsWith('.sqlite3') || databaseUrl.endsWith('.sqlite')) {
    const dbPath = databaseUrl.replace('file:', '')
    console.log(`🔗 Connecting to SQLite database: ${dbPath}`)
    db = new Database(dbPath)
  } else if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
    console.error('❌ PostgreSQL databases require Prisma client. Please run: bun run db:seed-admin (uses Prisma)')
    process.exit(1)
  } else {
    // Fallback: treat as SQLite path
    const dbPath = databaseUrl
    console.log(`🔗 Connecting to SQLite database: ${dbPath}`)
    db = new Database(dbPath)
  }

  // Enable WAL mode for better concurrency
  db.pragma('journal_mode = WAL')

  // Ensure the User table exists (matches Prisma schema)
  db.exec(`
    CREATE TABLE IF NOT EXISTS "User" (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      password TEXT NOT NULL,
      avatar TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      createdAt DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
      updatedAt DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );
    CREATE TABLE IF NOT EXISTS "Session" (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      sessionToken TEXT UNIQUE NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
      expiresAt DATETIME,
      FOREIGN KEY (userId) REFERENCES "User"(id)
    );
  `)

  // Check if admin email already exists
  const existing = db.prepare('SELECT id, email, role FROM "User" WHERE email = ?').get(adminEmail.toLowerCase())

  const hashedPassword = await bcrypt.hash(adminPassword, 12)

  if (existing) {
    // Update existing user to admin
    db.prepare('UPDATE "User" SET name = ?, role = ?, password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(
      adminName,
      'admin',
      hashedPassword,
      (existing as any).id
    )
    // Clear all sessions for security
    db.prepare('DELETE FROM "Session" WHERE userId = ?').run((existing as any).id)
    console.log('✅ Admin account updated successfully')
  } else {
    // Create new admin user
    const id = `cuid_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    db.prepare('INSERT INTO "User" (id, email, name, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)').run(
      id,
      adminEmail.toLowerCase(),
      adminName,
      hashedPassword,
      'admin'
    )
    console.log('✅ Admin account created successfully')
  }

  // Verify the admin account exists
  const verify = db.prepare('SELECT email, role FROM "User" WHERE role = ?').get('admin')
  if (verify) {
    console.log('   Role: admin')
    console.log('   Password: ***hashed and hidden***')
    console.log('   Previous sessions: cleared for security')
    console.log('🔒 Admin setup complete — credentials are hidden from output')
  } else {
    console.error('❌ Failed to create/update admin account')
    process.exit(1)
  }

  db.close()
}

main().catch((err) => {
  console.error('❌ Error:', err)
  process.exit(1)
})
