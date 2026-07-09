/**
 * rotate-admin.js
 * Rotates the admin password and clears all sessions.
 * 
 * SECURITY:
 * - Credentials are read ONLY from environment variables.
 * - No credentials are hardcoded, logged, or stored in source code.
 * - Passwords are hashed with bcrypt (12 rounds) before storage.
 * 
 * SUPPORTED DATABASES:
 * - SQLite (DATABASE_URL starts with "file:" or ends with .db/.sqlite/.sqlite3)
 * - PostgreSQL / Supabase (DATABASE_URL starts with "postgresql://" or "postgres://")
 * 
 * USAGE:
 *   1. Update ADMIN_PASSWORD in your .env file with the new password
 *   2. Run: bun run scripts/rotate-admin.js
 */

const bcrypt = require('bcryptjs')
const dotenv = require('dotenv')
const path = require('path')

// Load .env file
const envPath = path.join(__dirname, '..', '.env')
try {
  dotenv.config({ path: envPath })
} catch {
  // .env not found — will rely on system environment variables
}

function detectDatabaseType(url) {
  if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
    return 'postgresql'
  }
  return 'sqlite'
}

async function rotateSQLite(dbUrl, email, newPassword) {
  const Database = require('better-sqlite3')
  const dbPath = dbUrl.replace('file:', '')
  console.log(`🔗 Connecting to SQLite database: ${dbPath}`)

  const db = new Database(dbPath)

  const user = db.prepare('SELECT id, email, role FROM "User" WHERE email = ?').get(email)

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
  db.prepare('UPDATE "User" SET password = ?, "updatedAt" = CURRENT_TIMESTAMP WHERE id = ?').run(hashed, user.id)
  db.prepare('DELETE FROM "Session" WHERE userId = ?').run(user.id)

  console.log('✅ Admin password rotated successfully')
  console.log('   Email: ***hidden***')
  console.log('   All sessions cleared — must re-login with new password')
  console.log('🔒 Password rotation complete — credentials are hidden from output')

  db.close()
}

async function rotatePostgreSQL(dbUrl, email, newPassword) {
  console.log(`🔗 Connecting to PostgreSQL database...`)

  let pool
  try {
    const pg = require('pg')
    pool = new pg.Pool({ connectionString: dbUrl })
  } catch (e) {
    console.error('❌ Missing "pg" package. Please install it:')
    console.error('   npm install pg   (or: bun add pg)')
    console.error('   Then run this script again.')
    process.exit(1)
  }

  const user = await pool.query('SELECT id, email, role FROM "User" WHERE email = $1', [email])

  if (user.rows.length === 0) {
    console.error('❌ Admin user not found. Run seed-admin.ts first to create the admin account.')
    await pool.end()
    process.exit(1)
  }

  if (user.rows[0].role !== 'admin') {
    console.error('❌ User found but role is not "admin". Fix role first before rotating password.')
    await pool.end()
    process.exit(1)
  }

  const hashed = await bcrypt.hash(newPassword, 12)
  await pool.query('UPDATE "User" SET password = $1, "updatedAt" = NOW() WHERE id = $2', [hashed, user.rows[0].id])
  await pool.query('DELETE FROM "Session" WHERE "userId" = $1', [user.rows[0].id])

  console.log('✅ Admin password rotated successfully')
  console.log('   Email: ***hidden***')
  console.log('   All sessions cleared — must re-login with new password')
  console.log('🔒 Password rotation complete — credentials are hidden from output')

  await pool.end()
}

async function main() {
  const email = process.env.ADMIN_EMAIL
  const newPassword = process.env.ADMIN_PASSWORD
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || ''

  if (!email || !newPassword) {
    console.error('❌ Missing required environment variables')
    console.error('   Please set the following in your .env file:')
    console.error('   - ADMIN_EMAIL (required)')
    console.error('   - ADMIN_PASSWORD (required, min 8 characters)')
    console.error('   - DATABASE_URL (required)')
    process.exit(1)
  }

  if (newPassword.length < 8) {
    console.error('❌ New password must be at least 8 characters long')
    process.exit(1)
  }

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set. Cannot connect to any database.')
    process.exit(1)
  }

  const dbType = detectDatabaseType(databaseUrl)
  console.log(`📦 Database type: ${dbType.toUpperCase()}`)

  if (dbType === 'sqlite') {
    await rotateSQLite(databaseUrl, email.toLowerCase(), newPassword)
  } else {
    await rotatePostgreSQL(databaseUrl, email.toLowerCase(), newPassword)
  }
}

main().catch((e) => {
  console.error('❌ Error:', e)
  process.exit(1)
})
