const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)

  await prisma.user.upsert({
    where: { email: 'admin@brunch.com' },
    update: {},
    create: {
      email: 'admin@brunch.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log('Seed 完成：admin@brunch.com / admin123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
