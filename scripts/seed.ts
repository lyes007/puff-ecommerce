import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting database seed...")

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
        role: "ADMIN", // This is now properly typed as Role enum
      },
    })

    console.log("✅ Created admin user:", admin.email)

    // Check if products already exist
    const existingProducts = await prisma.product.count()

    if (existingProducts > 0) {
      console.log("📦 Products already exist, skipping product creation")
      console.log("🎉 Database seed completed!")
      console.log("📊 Summary:")
      console.log(`- Admin user: ${admin.email}`)
      console.log(`- Existing products: ${existingProducts}`)
      console.log("\n🔑 Admin Login Credentials:")
      console.log("Email: admin@puffshop.com")
      console.log("Password: admin123")
      return
    }

    // Create sample products only if none exist
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
      {
        name: "Classic Tobacco",
        description: "Traditional tobacco flavor for classic vaping enthusiasts.",
        price: 22.99,
        image: "/placeholder.svg?height=400&width=400",
        category: "Classic",
        stock: 80,
        lowStockThreshold: 20,
        featured: false,
        isActive: true,
        views: 134,
        sales: 12,
      },
      {
        name: "Citrus Burst",
        description: "Zesty citrus blend with a refreshing finish.",
        price: 26.99,
        image: "/placeholder.svg?height=400&width=400",
        category: "Disposable",
        stock: 55,
        lowStockThreshold: 10,
        featured: true,
        isActive: true,
        views: 201,
        sales: 19,
      },
      {
        name: "Vanilla Dream",
        description: "Smooth vanilla flavor with creamy undertones.",
        price: 28.99,
        image: "/placeholder.svg?height=400&width=400",
        category: "Premium",
        stock: 35,
        lowStockThreshold: 8,
        featured: false,
        isActive: true,
        views: 167,
        sales: 14,
      },
      {
        name: "Strawberry Delight",
        description: "Fresh strawberry flavor with natural sweetness.",
        price: 25.99,
        image: "/placeholder.svg?height=400&width=400",
        category: "Disposable",
        stock: 65,
        lowStockThreshold: 12,
        featured: true,
        isActive: true,
        views: 223,
        sales: 26,
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
        currentUses: 15,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
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
        currentUses: 8,
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        isActive: true,
      },
      {
        code: "BULK20",
        name: "Bulk Order Discount",
        description: "20% off orders over $100",
        type: "PERCENTAGE" as const, // Properly typed as DiscountType enum
        value: 20,
        minAmount: 100,
        maxUses: 25,
        currentUses: 3,
        startDate: new Date(),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        isActive: true,
      },
    ]

    for (const discountData of discounts) {
      const discount = await prisma.discount.create({
        data: discountData,
      })
      console.log("✅ Created discount:", discount.code)
    }

    // Create sample customers - FIXED: Using proper enum values
    const customers = [
      {
        email: "john.doe@example.com",
        name: "John Doe",
        password: await bcrypt.hash("password123", 12),
        role: "CUSTOMER" as const, // Properly typed as Role enum
        isActive: true,
      },
      {
        email: "jane.smith@example.com",
        name: "Jane Smith",
        password: await bcrypt.hash("password123", 12),
        role: "CUSTOMER" as const, // Properly typed as Role enum
        isActive: true,
      },
      {
        email: "mike.johnson@example.com",
        name: "Mike Johnson",
        password: await bcrypt.hash("password123", 12),
        role: "CUSTOMER" as const, // Properly typed as Role enum
        isActive: true,
      },
    ]

    for (const customerData of customers) {
      const customer = await prisma.user.create({
        data: customerData,
      })
      console.log("✅ Created customer:", customer.email)
    }

    console.log("🎉 Database seeded successfully!")
    console.log("📊 Summary:")
    console.log(`- Created 1 admin user`)
    console.log(`- Created ${products.length} products`)
    console.log(`- Created ${discounts.length} discount codes`)
    console.log(`- Created ${customers.length} sample customers`)
    console.log("\n🔑 Admin Login Credentials:")
    console.log("Email: admin@puffshop.com")
    console.log("Password: admin123")
    console.log("\n💡 Sample Customer Credentials:")
    console.log("Email: john.doe@example.com")
    console.log("Password: password123")
  } catch (error) {
    console.error("❌ Seeding failed:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
