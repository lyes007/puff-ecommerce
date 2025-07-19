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
        role: "ADMIN",
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

    // Create sample products with galleries and variants
    const productsData = [
      {
        name: "Premium Puff Pro",
        description:
          "High-quality disposable vape with premium flavors and long-lasting battery. Experience smooth vapor production with our advanced heating technology.",
        price: 29.99,
        category: "Disposable",
        stock: 50,
        lowStockThreshold: 10,
        featured: true,
        isActive: true,
        views: 245,
        sales: 18,
        gallery: [
          {
            url: "/placeholder.svg?height=400&width=400",
            alt: "Premium Puff Pro - Main View",
            isPrimary: true,
            order: 0,
          },
          {
            url: "/placeholder.svg?height=400&width=400",
            alt: "Premium Puff Pro - Side View",
            isPrimary: false,
            order: 1,
          },
          {
            url: "/placeholder.svg?height=400&width=400",
            alt: "Premium Puff Pro - Package",
            isPrimary: false,
            order: 2,
          },
        ],
        variants: [
          { name: "Flavor", value: "Mint", stock: 20, isActive: true, order: 0 },
          { name: "Flavor", value: "Berry", stock: 15, isActive: true, order: 1 },
          { name: "Flavor", value: "Vanilla", stock: 15, isActive: true, order: 2 },
        ],
      },
      {
        name: "Mint Fresh Puff",
        description:
          "Refreshing mint flavor with smooth vapor production. Perfect for those who enjoy a cool, crisp vaping experience.",
        price: 24.99,
        category: "Disposable",
        stock: 75,
        lowStockThreshold: 15,
        featured: true,
        isActive: true,
        views: 189,
        sales: 22,
        gallery: [
          { url: "/placeholder.svg?height=400&width=400", alt: "Mint Fresh Puff - Main", isPrimary: true, order: 0 },
          { url: "/placeholder.svg?height=400&width=400", alt: "Mint Fresh Puff - Detail", isPrimary: false, order: 1 },
        ],
        variants: [
          { name: "Size", value: "Regular", stock: 40, isActive: true, order: 0 },
          { name: "Size", value: "Large", price: 5.0, stock: 35, isActive: true, order: 1 },
        ],
      },
      {
        name: "Berry Blast Puff",
        description:
          "Sweet berry flavor combination for a delightful vaping experience. Made with natural berry extracts for authentic taste.",
        price: 27.99,
        category: "Disposable",
        stock: 60,
        lowStockThreshold: 12,
        featured: false,
        isActive: true,
        views: 156,
        sales: 15,
        gallery: [{ url: "/placeholder.svg?height=400&width=400", alt: "Berry Blast Puff", isPrimary: true, order: 0 }],
        variants: [
          { name: "Intensity", value: "Mild", stock: 30, isActive: true, order: 0 },
          { name: "Intensity", value: "Strong", stock: 30, isActive: true, order: 1 },
        ],
      },
      {
        name: "Tropical Paradise",
        description:
          "Exotic tropical fruit blend for a vacation-like experience. Transport yourself to paradise with every puff.",
        price: 32.99,
        category: "Premium",
        stock: 40,
        lowStockThreshold: 8,
        featured: true,
        isActive: true,
        views: 298,
        sales: 31,
        gallery: [
          { url: "/placeholder.svg?height=400&width=400", alt: "Tropical Paradise - Main", isPrimary: true, order: 0 },
          {
            url: "/placeholder.svg?height=400&width=400",
            alt: "Tropical Paradise - Lifestyle",
            isPrimary: false,
            order: 1,
          },
          {
            url: "/placeholder.svg?height=400&width=400",
            alt: "Tropical Paradise - Close-up",
            isPrimary: false,
            order: 2,
          },
          {
            url: "/placeholder.svg?height=400&width=400",
            alt: "Tropical Paradise - Package",
            isPrimary: false,
            order: 3,
          },
        ],
        variants: [
          { name: "Flavor", value: "Mango", stock: 15, isActive: true, order: 0 },
          { name: "Flavor", value: "Pineapple", stock: 12, isActive: true, order: 1 },
          { name: "Flavor", value: "Coconut", stock: 13, isActive: true, order: 2 },
        ],
      },
    ]

    // Create products with their galleries and variants
    for (const productData of productsData) {
      const { gallery, variants, ...productInfo } = productData

      const product = await prisma.product.create({
        data: productInfo,
      })

      // Create gallery images
      if (gallery && gallery.length > 0) {
        await prisma.productImage.createMany({
          data: gallery.map((image) => ({
            productId: product.id,
            ...image,
          })),
        })
      }

      // Create variants
      if (variants && variants.length > 0) {
        await prisma.productVariant.createMany({
          data: variants.map((variant) => ({
            productId: product.id,
            ...variant,
          })),
        })
      }

      console.log("✅ Created product:", product.name)
    }

    // Create sample discounts
    const discounts = [
      {
        code: "WELCOME10",
        name: "Welcome Discount",
        description: "10% off for new customers",
        type: "PERCENTAGE" as const,
        value: 10,
        minAmount: 25,
        maxUses: 100,
        currentUses: 15,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        code: "SAVE5",
        name: "Save $5",
        description: "$5 off orders over $50",
        type: "FIXED_AMOUNT" as const,
        value: 5,
        minAmount: 50,
        maxUses: 50,
        currentUses: 8,
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        code: "BULK20",
        name: "Bulk Order Discount",
        description: "20% off orders over $100",
        type: "PERCENTAGE" as const,
        value: 20,
        minAmount: 100,
        maxUses: 25,
        currentUses: 3,
        startDate: new Date(),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    ]

    for (const discountData of discounts) {
      const discount = await prisma.discount.create({
        data: discountData,
      })
      console.log("✅ Created discount:", discount.code)
    }

    // Create sample customers
    const customers = [
      {
        email: "john.doe@example.com",
        name: "John Doe",
        password: await bcrypt.hash("password123", 12),
        role: "CUSTOMER" as const,
        isActive: true,
      },
      {
        email: "jane.smith@example.com",
        name: "Jane Smith",
        password: await bcrypt.hash("password123", 12),
        role: "CUSTOMER" as const,
        isActive: true,
      },
      {
        email: "mike.johnson@example.com",
        name: "Mike Johnson",
        password: await bcrypt.hash("password123", 12),
        role: "CUSTOMER" as const,
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
    console.log(`- Created ${productsData.length} products with galleries and variants`)
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
