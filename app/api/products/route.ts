import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        gallery: {
          orderBy: { order: "asc" },
        },
        variants: {
          where: { isActive: true },
          orderBy: { order: "asc" },
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
    // Removed 'image' from destructuring
    const { name, description, price, category, stock, featured } = body

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number.parseFloat(price),
        // Removed 'image' field
        category,
        stock: Number.parseInt(stock),
        featured: featured || false,
      },
      include: {
        gallery: {
          orderBy: { order: "asc" },
        },
        variants: {
          orderBy: { order: "asc" },
        },
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
