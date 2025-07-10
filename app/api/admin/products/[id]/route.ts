import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        variants: true,
        stockLogs: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
        reviews: true,
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
    const { name, description, price, image, category, stock, lowStockThreshold, featured, isActive } = body

    // Get current stock for logging
    const currentProduct = await prisma.product.findUnique({
      where: { id: params.id },
      select: { stock: true },
    })

    const product = await prisma.product.update({
      where: { id: params.id },
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

    // Log stock change if stock was updated
    if (currentProduct && currentProduct.stock !== Number.parseInt(stock)) {
      await prisma.stockLog.create({
        data: {
          productId: params.id,
          oldStock: currentProduct.stock,
          newStock: Number.parseInt(stock),
          reason: "Admin update",
        },
      })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if product has any orders
    const orderItems = await prisma.orderItem.findFirst({
      where: { productId: params.id },
    })

    if (orderItems) {
      return NextResponse.json({ error: "Cannot delete product with existing orders" }, { status: 400 })
    }

    await prisma.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
