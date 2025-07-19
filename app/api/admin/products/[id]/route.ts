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
          orderBy: { order: "asc" },
        },
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
    const { name, description, price, category, stock, lowStockThreshold, featured, isActive, gallery, variants } = body

    // Get current stock for logging
    const currentProduct = await prisma.product.findUnique({
      where: { id: params.id },
      select: { stock: true },
    })

    // Update product with transaction
    const product = await prisma.$transaction(async (tx) => {
      // Update the product
      const updatedProduct = await tx.product.update({
        where: { id: params.id },
        data: {
          name,
          description,
          price: Number.parseFloat(price),
          category,
          stock: Number.parseInt(stock),
          lowStockThreshold: Number.parseInt(lowStockThreshold) || 10,
          featured: featured || false,
          isActive: isActive !== false,
        },
      })

      // Update gallery - delete existing and create new ones
      if (gallery) {
        await tx.productImage.deleteMany({
          where: { productId: params.id },
        })

        if (gallery.length > 0) {
          await tx.productImage.createMany({
            data: gallery.map((image: any, index: number) => ({
              productId: params.id,
              url: image.url,
              alt: image.alt || "",
              isPrimary: image.isPrimary || index === 0,
              order: image.order || index,
            })),
          })
        }
      }

      // Update variants - delete existing and create new ones
      if (variants) {
        await tx.productVariant.deleteMany({
          where: { productId: params.id },
        })

        if (variants.length > 0) {
          await tx.productVariant.createMany({
            data: variants.map((variant: any, index: number) => ({
              productId: params.id,
              name: variant.name,
              value: variant.value,
              price: variant.price ? Number.parseFloat(variant.price) : null,
              stock: Number.parseInt(variant.stock) || 0,
              sku: variant.sku || null,
              isActive: variant.isActive !== false,
              order: variant.order || index,
            })),
          })
        }
      }

      return updatedProduct
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

    // Fetch the complete updated product
    const completeProduct = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        gallery: { orderBy: { order: "asc" } },
        variants: { orderBy: { order: "asc" } },
      },
    })

    return NextResponse.json(completeProduct)
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

    // Delete product and all related data (cascade will handle gallery and variants)
    await prisma.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
