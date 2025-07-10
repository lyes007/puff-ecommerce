import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: true,
        stockLogs: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, price, image, category, stock, lowStockThreshold, featured, isActive } = body

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number.parseFloat(price),
        image,
        category,
        stock: Number.parseInt(stock),
        lowStockThreshold: Number.parseInt(lowStockThreshold) || 10,
        featured: featured || false,
        isActive: isActive !== false,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
