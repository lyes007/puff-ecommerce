import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { stock } = body

    // Get current stock for logging
    const currentProduct = await prisma.product.findUnique({
      where: { id: params.id },
      select: { stock: true, name: true },
    })

    if (!currentProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Update stock
    const product = await prisma.product.update({
      where: { id: params.id },
      data: { stock: Number.parseInt(stock) },
    })

    // Log stock change
    await prisma.stockLog.create({
      data: {
        productId: params.id,
        oldStock: currentProduct.stock,
        newStock: Number.parseInt(stock),
        reason: "Manual stock adjustment",
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error updating stock:", error)
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 })
  }
}
