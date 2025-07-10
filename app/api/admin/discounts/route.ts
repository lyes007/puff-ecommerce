import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const discounts = await prisma.discount.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(discounts)
  } catch (error) {
    console.error("Error fetching discounts:", error)
    return NextResponse.json({ error: "Failed to fetch discounts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, name, description, type, value, minAmount, maxUses, startDate, endDate, isActive } = body

    const discount = await prisma.discount.create({
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

    return NextResponse.json(discount, { status: 201 })
  } catch (error) {
    console.error("Error creating discount:", error)
    return NextResponse.json({ error: "Failed to create discount" }, { status: 500 })
  }
}
