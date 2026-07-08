import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'abdalaheh51@gmail.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456'
  
  const existing = await db.user.findUnique({ where: { email: adminEmail } })
  
  if (existing) {
    await db.user.update({
      where: { email: adminEmail },
      data: { role: 'admin', password: await bcrypt.hash(adminPassword, 10) },
    })
    console.log('Admin updated:', adminEmail)
  } else {
    const hashed = await bcrypt.hash(adminPassword, 10)
    await db.user.create({
      data: {
        email: adminEmail,
        name: 'Admin',
        password: hashed,
        role: 'admin',
      },
    })
    console.log('Admin created:', adminEmail)
  }
  
  // Do not log secrets to stdout
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
