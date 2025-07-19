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
          orderBy: { order: "asc" },
        },
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
    const { name, description, price, category, stock, lowStockThreshold, featured, isActive, gallery, variants } = body

    // Create product with transaction to ensure data consistency
    const product = await prisma.$transaction(async (tx) => {
      // Create the product first
      const newProduct = await tx.product.create({
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

      // Create gallery images if provided
      if (gallery && gallery.length > 0) {
        await tx.productImage.createMany({
          data: gallery.map((image: any, index: number) => ({
            productId: newProduct.id,
            url: image.url,
            alt: image.alt || "",
            isPrimary: image.isPrimary || index === 0,
            order: image.order || index,
          })),
        })
      }

      // Create variants if provided
      if (variants && variants.length > 0) {
        await tx.productVariant.createMany({
          data: variants.map((variant: any, index: number) => ({
            productId: newProduct.id,
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

      return newProduct
    })

    // Fetch the complete product with relations
    const completeProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        gallery: { orderBy: { order: "asc" } },
        variants: { orderBy: { order: "asc" } },
      },
    })

    return NextResponse.json(completeProduct, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
