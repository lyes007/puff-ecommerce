"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, Star, Grid, List, Zap, Heart } from "lucide-react"
import Navigation from "@/components/navigation"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterAndSortProducts()
  }, [products, searchTerm, selectedCategory, sortBy])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortProducts = () => {
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategory === "all" || product.category === selectedCategory),
    )

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    setFilteredProducts(filtered)
  }

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-light-blue/20 to-medium-blue/20">
        <Navigation />
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-light-blue border-t-dark-blue rounded-full animate-spin"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-medium-blue rounded-full animate-spin"
              style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
            ></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-light-blue/20 to-medium-blue/20">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 gradient-primary overflow-hidden">
        <div className="absolute inset-0 bg-dark-blue/20"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-cream/10 rounded-full animate-float"></div>
        <div
          className="absolute bottom-10 right-10 w-16 h-16 bg-light-blue/20 rounded-full animate-float"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-slide-in-top">
            Our <span className="text-cream">Products</span>
          </h1>
          <p
            className="text-xl text-light-blue/90 max-w-2xl mx-auto animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            Discover our premium collection of puffs and vapes
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 animate-fade-in-up border border-light-blue/20">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-medium-blue w-5 h-5" />
              <input
                type="text"
                placeholder="Search for amazing products..."
                className="w-full pl-12 pr-4 py-3 border border-light-blue rounded-xl focus:ring-4 focus:ring-medium-blue/20 focus:border-medium-blue transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-4 items-center">
              <select
                className="px-4 py-3 border border-light-blue rounded-xl focus:ring-4 focus:ring-medium-blue/20 focus:border-medium-blue transition-all duration-300 bg-white text-dark-blue"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>

              <select
                className="px-4 py-3 border border-light-blue rounded-xl focus:ring-4 focus:ring-medium-blue/20 focus:border-medium-blue transition-all duration-300 bg-white text-dark-blue"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              <div className="flex border border-light-blue rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 transition-all duration-300 ${viewMode === "grid" ? "bg-medium-blue text-white" : "text-dark-blue hover:bg-light-blue/30"}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 transition-all duration-300 ${viewMode === "list" ? "bg-medium-blue text-white" : "text-dark-blue hover:bg-light-blue/30"}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {filteredProducts.length > 0 ? (
          <div
            className={
              viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" : "space-y-6"
            }
          >
            {filteredProducts.map((product, index) =>
              viewMode === "grid" ? (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover-lift stagger-item border border-light-blue/20"
                >
                  <div className="aspect-square relative overflow-hidden image-container">
                    <Image
                      src={product.image || "/placeholder.svg?height=300&width=300"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Stock Badge */}
                    {product.stock < 10 && product.stock > 0 && (
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse-custom">
                        Low Stock
                      </div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-red-700 text-white px-3 py-1 rounded-full text-sm font-bold">
                        Out of Stock
                      </div>
                    )}

                    {/* Wishlist Button */}
                    <button className="absolute top-4 right-4 w-10 h-10 bg-cream/90 rounded-full flex items-center justify-center text-dark-blue hover:text-red-500 hover:bg-cream transition-all duration-300 hover-scale">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-3 text-dark-blue group-hover:text-medium-blue transition-colors duration-300 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl font-bold text-dark-blue">${product.price.toFixed(2)}</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">4.8</span>
                      </div>
                    </div>
                    <p className="text-sm text-medium-blue mb-4">Stock: {product.stock}</p>
                    <Link
                      href={`/products/${product.id}`}
                      className="w-full gradient-primary text-white py-3 px-6 rounded-xl hover:bg-dark-blue transition-all duration-300 text-center block font-semibold hover-glow group-hover:animate-pulse-custom"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ) : (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover-lift animate-fade-in-left border border-light-blue/20"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 aspect-square md:aspect-auto relative overflow-hidden image-container">
                      <Image
                        src={product.image || "/placeholder.svg?height=300&width=300"}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="md:w-2/3 p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-2xl mb-3 text-dark-blue group-hover:text-medium-blue transition-colors duration-300">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">{product.description}</p>
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-3xl font-bold text-dark-blue">${product.price.toFixed(2)}</span>
                          <div className="flex items-center">
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            <span className="text-gray-600 ml-1">4.8 (124 reviews)</span>
                          </div>
                        </div>
                        <p className="text-medium-blue mb-4">Stock: {product.stock} available</p>
                      </div>
                      <Link
                        href={`/products/${product.id}`}
                        className="inline-flex items-center justify-center gradient-primary text-white py-3 px-8 rounded-xl hover:bg-dark-blue transition-all duration-300 font-semibold hover-glow group-hover:animate-pulse-custom"
                      >
                        <Zap className="w-5 h-5 mr-2" />
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="w-24 h-24 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-custom">
              <Search className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-dark-blue mb-4">No products found</h3>
            <p className="text-gray-600 text-lg mb-8">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
              }}
              className="gradient-primary text-white px-8 py-4 rounded-xl hover:bg-dark-blue transition-all duration-300 font-semibold hover-lift"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
