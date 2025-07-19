"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Star, Plus, Minus, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react"
import Navigation from "@/components/navigation"
import { addToCart } from "@/lib/cart"
import toast from "react-hot-toast"

interface ProductImage {
  id: string
  url: string
  alt?: string
  isPrimary: boolean
  order: number
}

interface ProductVariant {
  id: string
  name: string
  value: string
  price?: number
  stock: number
  sku?: string
  isActive: boolean
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  gallery: ProductImage[]
  variants: ProductVariant[]
  reviews: Array<{
    id: string
    name: string
    rating: number
    comment: string
    createdAt: string
  }>
}

export default function ProductPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
      } else {
        throw new Error("Product not found")
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      toast.error("Product not found")
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return

    const cartItem = {
      id: product.id,
      name: product.name,
      price: selectedVariant ? selectedVariant.price || product.price : product.price,
      image: product.gallery?.find((img) => img.isPrimary)?.url || product.gallery?.[0]?.url || "",
      stock: selectedVariant ? selectedVariant.stock : product.stock,
      variantId: selectedVariant?.id,
      variantName: selectedVariant?.name,
      variantValue: selectedVariant?.value,
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(cartItem)
    }

    toast.success(`Added ${quantity} item(s) to cart!`)
    window.dispatchEvent(new Event("cartUpdated"))
  }

  const nextImage = () => {
    if (product?.gallery && product.gallery.length > 1) {
      setSelectedImageIndex((prev) => (prev + 1) % product.gallery.length)
    }
  }

  const prevImage = () => {
    if (product?.gallery && product.gallery.length > 1) {
      setSelectedImageIndex((prev) => (prev - 1 + product.gallery.length) % product.gallery.length)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-light-blue/20 to-medium-blue/20">
        <Navigation />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-light-blue/20 to-medium-blue/20">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0

  const currentStock = selectedVariant ? selectedVariant.stock : product.stock
  const currentPrice = selectedVariant ? selectedVariant.price || product.price : product.price

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-light-blue/20 to-medium-blue/20">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images Gallery */}
          <div className="space-y-4">
            <div className="aspect-square relative bg-white rounded-2xl overflow-hidden shadow-lg">
              {product.gallery && product.gallery.length > 0 ? (
                <>
                  <Image
                    src={product.gallery[selectedImageIndex]?.url || "/placeholder.svg?height=600&width=600"}
                    alt={product.gallery[selectedImageIndex]?.alt || product.name}
                    fill
                    className="object-cover"
                  />
                  {product.gallery.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-300"
                      >
                        <ChevronLeft className="w-6 h-6 text-dark-blue" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-300"
                      >
                        <ChevronRight className="w-6 h-6 text-dark-blue" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {product.gallery && product.gallery.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.gallery.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      selectedImageIndex === index ? "border-medium-blue" : "border-gray-200 hover:border-light-blue"
                    }`}
                  >
                    <Image
                      src={image.url || "/placeholder.svg?height=80&width=80"}
                      alt={image.alt || `${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">({product.reviews.length} reviews)</span>
                </div>
                <span className="text-sm text-gray-500">Category: {product.category}</span>
              </div>
              <p className="text-4xl font-bold text-purple-600 mb-4">${currentPrice.toFixed(2)}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Product Variations */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Options</h3>
                <div className="space-y-4">
                  {/* Group variants by name */}
                  {Object.entries(
                    product.variants.reduce(
                      (acc, variant) => {
                        if (!acc[variant.name]) acc[variant.name] = []
                        acc[variant.name].push(variant)
                        return acc
                      },
                      {} as Record<string, ProductVariant[]>,
                    ),
                  ).map(([variantName, variants]) => (
                    <div key={variantName}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{variantName}</label>
                      <div className="flex flex-wrap gap-2">
                        {variants.map((variant) => (
                          <button
                            key={variant.id}
                            onClick={() => setSelectedVariant(variant)}
                            disabled={!variant.isActive || variant.stock === 0}
                            className={`px-4 py-2 rounded-lg border transition-all duration-300 ${
                              selectedVariant?.id === variant.id
                                ? "border-medium-blue bg-medium-blue text-white"
                                : variant.isActive && variant.stock > 0
                                  ? "border-gray-300 hover:border-medium-blue"
                                  : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {variant.value}
                            {variant.price && variant.price !== product.price && (
                              <span className="ml-1 text-xs">(+${(variant.price - product.price).toFixed(2)})</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-900">Quantity</span>
                <span
                  className={`text-sm px-3 py-1 rounded-full ${
                    currentStock === 0
                      ? "bg-red-100 text-red-800"
                      : currentStock < 10
                        ? "bg-orange-100 text-orange-800"
                        : "bg-green-100 text-green-800"
                  }`}
                >
                  {currentStock === 0 ? "Out of Stock" : "Available"}
                </span>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity >= currentStock}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={currentStock === 0}
                  className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {currentStock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Features</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Premium quality materials</li>
                <li>• Fast and reliable delivery</li>
                <li>• Pay on delivery option</li>
                <li>• For adult smokers only</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
          {product.reviews.length > 0 ? (
            <div className="space-y-6">
              {product.reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.name}</h4>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
