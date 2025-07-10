import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Generate a simple text invoice (in a real app, you'd use a PDF library)
    const invoiceText = `
INVOICE
=======

Order ID: ${order.id}
Date: ${new Date(order.createdAt).toLocaleDateString()}
Customer: ${order.customerName}
Email: ${order.customerEmail}
Phone: ${order.customerPhone}

Shipping Address:
${order.shippingAddress}

Items:
${order.items
  .map(
    (item) =>
      `- ${item.product.name} x${item.quantity} @ $${item.price.toFixed(2)} = $${(item.price * item.quantity).toFixed(2)}`,
  )
  .join("\n")}

Total: $${order.total.toFixed(2)}
Status: ${order.status}

Thank you for your business!
    `.trim()

    // Return as downloadable text file
    return new NextResponse(invoiceText, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="invoice-${order.id}.txt"`,
      },
    })
  } catch (error) {
    console.error("Error generating invoice:", error)
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 })
  }
}
