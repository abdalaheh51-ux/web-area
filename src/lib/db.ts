import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const cachedPrisma = globalForPrisma.prisma
const hasAll = cachedPrisma && typeof (cachedPrisma as any).projectRequest !== 'undefined' && typeof (cachedPrisma as any).visitorComment !== 'undefined'

export const db = hasAll
  ? cachedPrisma!
  : (() => {
      const client = new PrismaClient({ log: ['error', 'warn'] })
      if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client
      return client
    })()
