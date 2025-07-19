import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        gallery: {
          orderBy: { order: "asc" },
        },
        variants: {
          where: { isActive: true },
          orderBy: { order: "asc" },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    // Removed 'image' from destructuring
    const { name, description, price, category, stock, featured } = body

    const product = await prisma.product.update({
      where: { id: params.id },
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

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
