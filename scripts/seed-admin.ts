/**
 * seed-admin.ts
 * Creates or updates the admin account in the database.
 * 
 * SECURITY:
 * - Credentials are read ONLY from environment variables (.env or system env).
 * - No credentials are hardcoded, logged, or stored in source code.
 * - The .env file is git-ignored and never committed to Git/GitHub.
 * - Passwords are hashed with bcrypt (12 rounds) before storage.
 * - All output hides sensitive data (email/password are never printed in full).
 * 
 * SUPPORTED DATABASES:
 * - SQLite (DATABASE_URL starts with "file:" or ends with .db/.sqlite/.sqlite3)
 * - PostgreSQL / Supabase (DATABASE_URL starts with "postgresql://" or "postgres://")
 * 
 * USAGE:
 *   1. Set in your .env file:
 *      ADMIN_EMAIL=your-admin-email@example.com
 *      ADMIN_PASSWORD=your-strong-password
 *      ADMIN_NAME=Admin (optional)
 *      DATABASE_URL=your-database-url
 *   2. Run: bun run scripts/seed-admin.ts
 */

import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient } from '@prisma/client'

// Load environment variables in the same precedence order used by Next.js
const __dirname = dirname(fileURLToPath(import.meta.url))
const envDir = join(__dirname, '..')

try {
  dotenv.config({ path: join(envDir, '.env') })
  dotenv.config({ path: join(envDir, '.env.local'), override: true })
} catch {
  // Env files not found — will rely on system environment variables
}

function detectDatabaseType(url: string): 'sqlite' | 'postgresql' {
  if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
    return 'postgresql'
  }
  return 'sqlite'
}

// ─── SQLite Handler ──────────────────────────────────────────────
async function seedSQLite(dbUrl: string, email: string, password: string, name: string) {
  const Database = (await import('better-sqlite3')).default
  const dbPath = dbUrl.replace('file:', '')
  console.log(`🔗 Connecting to SQLite database: ${dbPath}`)
  
  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  // Ensure tables exist
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

  const hashed = await bcrypt.hash(password, 12)
  const existing = db.prepare('SELECT id FROM "User" WHERE email = ?').get(email)

  if (existing) {
    db.prepare('UPDATE "User" SET name = ?, role = ?, password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(
      name, 'admin', hashed, (existing as any).id
    )
    db.prepare('DELETE FROM "Session" WHERE userId = ?').run((existing as any).id)
    console.log('✅ Admin account updated successfully')
  } else {
    const id = `cuid_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    db.prepare('INSERT INTO "User" (id, email, name, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)').run(
      id, email, name, hashed, 'admin'
    )
    console.log('✅ Admin account created successfully')
  }

  const verify = db.prepare('SELECT email, role FROM "User" WHERE role = ?').get('admin')
  if (!verify) {
    console.error('❌ Failed to create/update admin account')
    db.close()
    process.exit(1)
  }

  db.close()
  return true
}

// ─── PostgreSQL Handler ──────────────────────────────────────────
async function seedPostgreSQL(_dbUrl: string, email: string, password: string, name: string) {
  console.log(`🔗 Connecting to PostgreSQL database...`)

  const prisma = new PrismaClient()
  const hashed = await bcrypt.hash(password, 12)

  try {
    const existing = await prisma.user.findUnique({ where: { email } })

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          name,
          role: 'admin',
          password: hashed,
        },
      })
      await prisma.session.deleteMany({ where: { userId: existing.id } })
      console.log('✅ Admin account updated successfully')
    } else {
      await prisma.user.create({
        data: {
          email,
          name,
          password: hashed,
          role: 'admin',
        },
      })
      console.log('✅ Admin account created successfully')
    }

    const verify = await prisma.user.findFirst({ where: { role: 'admin' } })
    if (!verify) {
      console.error('❌ Failed to create/update admin account')
      process.exit(1)
    }

    return true
  } finally {
    await prisma.$disconnect()
  }
}

// ─── Main ────────────────────────────────────────────────────────
async function main() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  const adminName = process.env.ADMIN_NAME || 'Admin'
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || ''

  // Validate inputs
  if (!adminEmail || !adminPassword) {
    console.error('❌ Missing required environment variables')
    console.error('   Please set the following in your .env file:')
    console.error('   - ADMIN_EMAIL (required)')
    console.error('   - ADMIN_PASSWORD (required, min 8 characters)')
    console.error('   - ADMIN_NAME (optional, defaults to "Admin")')
    console.error('   - DATABASE_URL (required)')
    process.exit(1)
  }

  if (adminPassword.length < 8) {
    console.error('❌ Admin password must be at least 8 characters long')
    process.exit(1)
  }

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set. Cannot connect to any database.')
    console.error('   Please set DATABASE_URL in your .env file.')
    console.error('   For PostgreSQL: postgresql://user:pass@host:port/dbname')
    console.error('   For SQLite:     file:./db/custom.db')
    process.exit(1)
  }

  const dbType = detectDatabaseType(databaseUrl)
  console.log(`📦 Database type: ${dbType.toUpperCase()}`)

  if (dbType === 'sqlite') {
    await seedSQLite(databaseUrl, adminEmail.toLowerCase(), adminPassword, adminName)
  } else {
    await seedPostgreSQL(databaseUrl, adminEmail.toLowerCase(), adminPassword, adminName)
  }

  console.log('   Role: admin')
  console.log('   Password: ***hashed and hidden***')
  console.log('   Previous sessions: cleared for security')
  console.log('🔒 Admin setup complete — credentials are hidden from output')
}

main().catch((err) => {
  console.error('❌ Error:', err)
  process.exit(1)
})
