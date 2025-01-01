import { PrismaClient, Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        name: 'Admin User',
        hashedPassword: hashedPassword,
        role: 'ADMIN',
      } as Prisma.UserUncheckedCreateInput,
    })

    console.log('Admin user created:', admin.email)

    // Create a sample blog post
    const post = await prisma.blogPost.create({
      data: {
        title: 'Welcome to Our Blog',
        slug: 'welcome-to-our-blog',
        excerpt: 'This is our first blog post. We\'re excited to share our journey with you.',
        content: '<h2>Welcome to Our Blog!</h2><p>This is our first blog post. We\'re excited to share our journey with you.</p><p>Stay tuned for more content!</p>',
        category: 'Announcements',
        published: true,
        authorId: admin.id,
      } as Prisma.BlogPostUncheckedCreateInput,
    })

    console.log('Sample blog post created:', post.title)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main() 