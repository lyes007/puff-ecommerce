"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Package, Truck, Clock } from "lucide-react"
import Navigation from "@/components/navigation"

interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  total: number
  status: string
  createdAt: string
  items: Array<{
    quantity: number
    price: number
    product: {
      name: string
      image: string
    }
  }>
}

export default function OrderConfirmationPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id as string)
    }
  }, [params.id])

  const fetchOrder = async (id: string) => {
    try {
      const response = await fetch(`/api/orders/${id}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
      }
    } catch (error) {
      console.error("Error fetching order:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600">The order you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your order. We'll send you updates via email.</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Order ID:</span> #{order.id.slice(-8)}
                </p>
                <p>
                  <span className="font-medium">Date:</span> {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Status:</span>
                  <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    {order.status}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Total:</span> ${order.total.toFixed(2)}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Name:</span> {order.customerName}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {order.customerEmail}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {order.customerPhone}
                </p>
                <p>
                  <span className="font-medium">Address:</span> {order.shippingAddress}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div>
                    <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Order Processing</h3>
              <p className="text-sm text-gray-600">We're preparing your order</p>
            </div>
            <div className="text-center">
              <Truck className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Shipping</h3>
              <p className="text-sm text-gray-600">Your order will be shipped soon</p>
            </div>
            <div className="text-center">
              <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Delivery</h3>
              <p className="text-sm text-gray-600">Estimated 2-3 business days</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/products"
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold mr-4"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="inline-block border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
