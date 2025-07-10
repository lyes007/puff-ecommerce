import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const discount = await prisma.discount.findUnique({
      where: { id: params.id },
    })

    if (!discount) {
      return NextResponse.json({ error: "Discount not found" }, { status: 404 })
    }

    return NextResponse.json(discount)
  } catch (error) {
    console.error("Error fetching discount:", error)
    return NextResponse.json({ error: "Failed to fetch discount" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { code, name, description, type, value, minAmount, maxUses, startDate, endDate, isActive } = body

    const discount = await prisma.discount.update({
      where: { id: params.id },
      data: {
        code,
        name,
        description,
        type,
        value: Number.parseFloat(value),
        minAmount: minAmount ? Number.parseFloat(minAmount) : null,
        maxUses: maxUses ? Number.parseInt(maxUses) : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== false,
      },
    })

    return NextResponse.json(discount)
  } catch (error) {
    console.error("Error updating discount:", error)
    return NextResponse.json({ error: "Failed to update discount" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.discount.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Discount deleted successfully" })
  } catch (error) {
    console.error("Error deleting discount:", error)
    return NextResponse.json({ error: "Failed to delete discount" }, { status: 500 })
  }
}
