const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = (process.env.ADMIN_EMAIL || process.argv[2])
  const newPassword = (process.env.ADMIN_PASSWORD || process.argv[3])

  if (!email || !newPassword) {
    console.error('Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/rotate-admin.js')
    process.exit(1)
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user) {
    console.error('Admin user not found:', email)
    process.exit(1)
  }

  const hashed = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })

  // delete all sessions for this user
  await prisma.session.deleteMany({ where: { userId: user.id } })

  console.log('Admin password rotated and sessions cleared for', email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
