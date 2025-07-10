import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🚀 Starting production database seed...")

  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 12)

    const admin = await prisma.user.upsert({
      where: { email: "admin@puffshop.com" },
      update: {},
      create: {
        email: "admin@puffshop.com",
        name: "Admin User",
        password: hashedPassword,
        role: "ADMIN" as const, // Properly typed as Role enum
      },
    })

    console.log("✅ Created admin user:", admin.email)

    // Check if products already exist
    const existingProducts = await prisma.product.count()

    if (existingProducts > 0) {
      console.log("📦 Products already exist, skipping product creation")
      console.log("🎉 Production seed completed!")
      return
    }

    // Create sample products
    const products = [
      {
        name: "Premium Puff Pro",
        description: "High-quality disposable vape with premium flavors and long-lasting battery.",
        price: 29.99,
        image: "/placeholder.svg?height=400&width=400",
        category: "Disposable",
        stock: 50,
        lowStockThreshold: 10,
        featured: true,
        isActive: true,
        views: 245,
        sales: 18,
      },
      {
        name: "Mint Fresh Puff",
        description: "Refreshing mint flavor with smooth vapor production.",
        price: 24.99,
        image: "/placeholder.svg?height=400&width=400",
        category: "Disposable",
        stock: 75,
        lowStockThreshold: 15,
        featured: true,
        isActive: true,
        views: 189,
        sales: 22,
      },
      {
        name: "Berry Blast Puff",
        description: "Sweet berry flavor combination for a delightful vaping experience.",
        price: 27.99,
        image: "/placeholder.svg?height=400&width=400",
        category: "Disposable",
        stock: 60,
        lowStockThreshold: 12,
        featured: false,
        isActive: true,
        views: 156,
        sales: 15,
      },
      {
        name: "Tropical Paradise",
        description: "Exotic tropical fruit blend for a vacation-like experience.",
        price: 32.99,
        image: "/placeholder.svg?height=400&width=400",
        category: "Premium",
        stock: 40,
        lowStockThreshold: 8,
        featured: true,
        isActive: true,
        views: 298,
        sales: 31,
      },
    ]

    // Create products
    for (const productData of products) {
      const product = await prisma.product.create({
        data: productData,
      })
      console.log("✅ Created product:", product.name)
    }

    // Create sample discounts - FIXED: Using proper enum values
    const discounts = [
      {
        code: "WELCOME10",
        name: "Welcome Discount",
        description: "10% off for new customers",
        type: "PERCENTAGE" as const, // Properly typed as DiscountType enum
        value: 10,
        minAmount: 25,
        maxUses: 100,
        currentUses: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        code: "SAVE5",
        name: "Save $5",
        description: "$5 off orders over $50",
        type: "FIXED_AMOUNT" as const, // Properly typed as DiscountType enum
        value: 5,
        minAmount: 50,
        maxUses: 50,
        currentUses: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    ]

    for (const discountData of discounts) {
      const discount = await prisma.discount.create({
        data: discountData,
      })
      console.log("✅ Created discount:", discount.code)
    }

    console.log("🎉 Production database seeded successfully!")
    console.log("📊 Summary:")
    console.log(`- Created 1 admin user`)
    console.log(`- Created ${products.length} products`)
    console.log(`- Created ${discounts.length} discount codes`)
    console.log("\n🔑 Admin Login Credentials:")
    console.log("Email: admin@puffshop.com")
    console.log("Password: admin123")
  } catch (error) {
    console.error("❌ Production seeding failed:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
