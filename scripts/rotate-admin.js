/**
 * rotate-admin.js
 * Rotates the admin password and clears all sessions.
 * 
 * SECURITY: Reads credentials ONLY from environment variables.
 * No credentials are hardcoded, logged, or stored in source code.
 * 
 * Usage:
 *   1. Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file
 *   2. Run: bun run scripts/rotate-admin.js
 */

const Database = require('better-sqlite3')
const bcrypt = require('bcryptjs')
const dotenv = require('dotenv')
const path = require('path')
const fs = require('fs')

// Load .env file
const envPath = path.join(__dirname, '..', '.env')
try {
  dotenv.config({ path: envPath })
} catch {
  // .env not found — will rely on system environment variables
}

async function main() {
  const email = process.env.ADMIN_EMAIL
  const newPassword = process.env.ADMIN_PASSWORD

  if (!email || !newPassword) {
    console.error('❌ Missing required environment variables')
    console.error('   Please set the following in your .env file:')
    console.error('   - ADMIN_EMAIL (required)')
    console.error('   - ADMIN_PASSWORD (required, min 8 characters)')
    process.exit(1)
  }

  if (newPassword.length < 8) {
    console.error('❌ New password must be at least 8 characters long')
    process.exit(1)
  }

  const databaseUrl = process.env.DATABASE_URL || 'file:./db/custom.db'

  let db
  if (databaseUrl.startsWith('file:') || databaseUrl.endsWith('.db') || databaseUrl.endsWith('.sqlite3') || databaseUrl.endsWith('.sqlite')) {
    const dbPath = databaseUrl.replace('file:', '')
    console.log(`🔗 Connecting to SQLite database: ${dbPath}`)
    db = new Database(dbPath)
  } else {
    console.error('❌ PostgreSQL databases require Prisma client. Please run: bun run db:rotate-admin (uses Prisma)')
    process.exit(1)
  }

  const user = db.prepare('SELECT id, email, role FROM "User" WHERE email = ?').get(email.toLowerCase())

  if (!user) {
    console.error('❌ Admin user not found. Run seed-admin.ts first to create the admin account.')
    db.close()
    process.exit(1)
  }

  if (user.role !== 'admin') {
    console.error('❌ User found but role is not "admin". Fix role first before rotating password.')
    db.close()
    process.exit(1)
  }

  const hashed = await bcrypt.hash(newPassword, 12)
  db.prepare('UPDATE "User" SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(hashed, user.id)

  // Delete all sessions to force re-login with new password
  db.prepare('DELETE FROM "Session" WHERE userId = ?').run(user.id)

  console.log('✅ Admin password rotated successfully')
  console.log('   Email: ***hidden***')
  console.log('   All sessions cleared — must re-login with new password')
  console.log('🔒 Password rotation complete — credentials are hidden from output')

  db.close()
}

main().catch((e) => {
  console.error('❌ Error:', e)
  process.exit(1)
})
