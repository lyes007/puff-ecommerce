import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const [totalSales, totalOrders, totalCustomers, todayOrders, lowStockProducts, topProducts, orderStatusData] =
      await Promise.all([
        prisma.order.aggregate({
          _sum: { total: true },
        }),
        prisma.order.count(),
        prisma.user.count({ where: { role: "CUSTOMER" } }),
        prisma.order.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        prisma.product.count({
          where: {
            stock: {
              lte: prisma.product.fields.lowStockThreshold,
            },
          },
        }),
        prisma.product.findMany({
          orderBy: { sales: "desc" },
          take: 10,
          select: { name: true, sales: true },
        }),
        prisma.order.groupBy({
          by: ["status"],
          _count: { status: true },
        }),
      ])

    // Generate mock sales data for the last 7 days
    const salesData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return {
        date: date.toISOString().split("T")[0],
        sales: Math.floor(Math.random() * 1000) + 500,
      }
    }).reverse()

    const analytics = {
      totalSales: totalSales._sum.total || 0,
      totalOrders,
      totalCustomers,
      todayOrders,
      lowStockProducts,
      salesData,
      topProducts,
      orderStatusData: orderStatusData.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
