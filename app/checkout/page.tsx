"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { CreditCard, Truck } from "lucide-react"
import Navigation from "@/components/navigation"
import { getCart, clearCart, getCartTotal, type CartItem } from "@/lib/cart"
import toast from "react-hot-toast"

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddress: "",
    notes: "",
  })

  useEffect(() => {
    const cartItems = getCart()
    if (cartItems.length === 0) {
      router.push("/cart")
      return
    }
    setCart(cartItems)
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const orderData = {
        ...formData,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          selectedVariation: item.selectedVariation
            ? {
                name: item.selectedVariation.name,
                value: item.selectedVariation.value,
                price: item.selectedVariation.price,
              }
            : null,
        })),
        total: getCartTotal(cart),
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const order = await response.json()
        clearCart()
        window.dispatchEvent(new Event("cartUpdated"))
        toast.success("Order placed successfully!")
        router.push(`/order-confirmation/${order.id}`)
      } else {
        throw new Error("Failed to place order")
      }
    } catch (error) {
      console.error("Error placing order:", error)
      toast.error("Failed to place order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const total = getCartTotal(cart)

  if (cart.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Information</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.customerName}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="customerEmail"
                  name="customerEmail"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="customerPhone"
                  name="customerPhone"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Address *
                </label>
                <textarea
                  id="shippingAddress"
                  name="shippingAddress"
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.shippingAddress}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Order Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any special instructions for delivery..."
                />
              </div>

              {/* Payment Method */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-800">Pay on Delivery</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Pay with cash when your order is delivered to your doorstep.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {cart.map((item, index) => (
                <div key={`${item.id}-${item.variationId || index}`} className="flex items-center space-x-4">
                  <div className="w-16 h-16 relative flex-shrink-0 image-container">
                    <Image
                      src={item.image || "/placeholder.svg?height=64&width=64"}
                      alt={item.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    {item.selectedVariation && (
                      <p className="text-sm text-medium-blue">
                        {item.selectedVariation.name}: {item.selectedVariation.value}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                    {item.selectedVariation?.price && item.selectedVariation.price > 0 && (
                      <p className="text-xs text-gray-500">
                        Includes +${(item.selectedVariation.price * item.quantity).toFixed(2)} for{" "}
                        {item.selectedVariation.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-purple-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Truck className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-800">Free Delivery</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">Estimated delivery: 2-3 business days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
