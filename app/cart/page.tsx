"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Navigation from "@/components/navigation"
import { getCart, updateCartQuantity, removeFromCart, getCartTotal, type CartItem } from "@/lib/cart"

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setCart(getCart())
    setLoading(false)
  }, [])

  const getItemKey = (item: CartItem) => {
    return item.selectedVariation ? `${item.id}-${item.selectedVariation.id || item.selectedVariation.value}` : item.id
  }

  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    const itemKey = getItemKey(item)
    updateCartQuantity(itemKey, newQuantity)
    setCart(getCart())
    window.dispatchEvent(new Event("cartUpdated"))
  }

  const handleRemoveItem = (item: CartItem) => {
    const itemKey = getItemKey(item)
    removeFromCart(itemKey)
    setCart(getCart())
    window.dispatchEvent(new Event("cartUpdated"))
  }

  const total = getCartTotal(cart)

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Add some products to get started!</p>
            <Link
              href="/products"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {cart.map((item, index) => (
                  <div
                    key={getItemKey(item)}
                    className="flex items-center p-6 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="w-20 h-20 relative flex-shrink-0 image-container">
                      <Image
                        src={item.image || "/placeholder.svg?height=80&width=80"}
                        alt={item.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>

                    <div className="flex-1 ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      {item.selectedVariation && (
                        <p className="text-sm text-medium-blue font-medium">
                          {item.selectedVariation.name}: {item.selectedVariation.value}
                          {item.selectedVariation.price && item.selectedVariation.price > 0 && (
                            <span className="text-gray-500 ml-1">(+TND {item.selectedVariation.price.toFixed(2)})</span>
                          )}
                        </p>
                      )}
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500">Price:</span>
                        {item.selectedVariation && item.selectedVariation.price !== undefined && (
                          <span className="text-gray-500 ml-1">(+TND {item.selectedVariation.price.toFixed(2)})</span>
                        )}
                        <p className="text-purple-600 font-bold ml-2">TND {item.price.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="w-8 text-center font-semibold">{item.quantity}</span>

                      <button
                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleRemoveItem(item)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors ml-4"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center text-xl font-bold mb-6">
                      <span>Total:</span>
                      <span className="font-semibold">TND {total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold mb-6">
                      <span>Grand Total:</span>
                      <span className="text-lg font-bold text-purple-600">TND {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors text-center block font-semibold"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  href="/products"
                  className="w-full mt-3 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors text-center block"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
