"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Package,
  ShoppingCart,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Users,
  AlertTriangle,
  Eye,
  Download,
  Search,
  BarChart3,
  PieChart,
  Bell,
  Tag,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import Image from "next/image"
import toast from "react-hot-toast"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
  lowStockThreshold: number
  featured: boolean
  isActive: boolean
  views: number
  sales: number
  createdAt: string
  variants?: ProductVariant[]
}

interface ProductVariant {
  id: string
  name: string
  value: string
  price?: number
  stock: number
}

interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  total: number
  status: string
  notes?: string
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

interface Customer {
  id: string
  email: string
  name?: string
  isActive: boolean
  createdAt: string
  orders: Order[]
}

interface Discount {
  id: string
  code: string
  name: string
  description?: string
  type: string
  value: number
  minAmount?: number
  maxUses?: number
  currentUses: number
  startDate: string
  endDate: string
  isActive: boolean
}

interface Analytics {
  totalSales: number
  totalOrders: number
  totalCustomers: number
  todayOrders: number
  lowStockProducts: number
  salesData: Array<{ date: string; sales: number }>
  topProducts: Array<{ name: string; sales: number }>
  orderStatusData: Array<{ status: string; count: number }>
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  // Product Management States
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    stock: "",
    lowStockThreshold: "10",
    featured: false,
    isActive: true,
  })

  // Order Management States
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderFilter, setOrderFilter] = useState("all")
  const [orderSearch, setOrderSearch] = useState("")

  // Customer Management States
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Discount Management States
  const [showDiscountForm, setShowDiscountForm] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null)
  const [discountForm, setDiscountForm] = useState({
    code: "",
    name: "",
    description: "",
    type: "PERCENTAGE",
    value: "",
    minAmount: "",
    maxUses: "",
    startDate: "",
    endDate: "",
    isActive: true,
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      const [productsRes, ordersRes, customersRes, discountsRes, analyticsRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/orders"),
        fetch("/api/admin/customers"),
        fetch("/api/admin/discounts"),
        fetch("/api/admin/analytics"),
      ])

      const [productsData, ordersData, customersData, discountsData, analyticsData] = await Promise.all([
        productsRes.json(),
        ordersRes.json(),
        customersRes.json(),
        discountsRes.json(),
        analyticsRes.json(),
      ])

      setProducts(productsData)
      setOrders(ordersData)
      setCustomers(customersData)
      setDiscounts(discountsData)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  // Product Management Functions
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : "/api/admin/products"
      const method = editingProduct ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productForm),
      })

      if (response.ok) {
        toast.success(editingProduct ? "Product updated!" : "Product created!")
        setShowProductForm(false)
        setEditingProduct(null)
        resetProductForm()
        fetchAllData()
      } else {
        throw new Error("Failed to save product")
      }
    } catch (error) {
      console.error("Error saving product:", error)
      toast.error("Failed to save product")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast.success("Product deleted!")
        fetchAllData()
      } else {
        throw new Error("Failed to delete product")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Failed to delete product")
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      category: product.category,
      stock: product.stock.toString(),
      lowStockThreshold: product.lowStockThreshold.toString(),
      featured: product.featured,
      isActive: product.isActive,
    })
    setShowProductForm(true)
  }

  const resetProductForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      image: "",
      category: "",
      stock: "",
      lowStockThreshold: "10",
      featured: false,
      isActive: true,
    })
  }

  // Order Management Functions
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast.success("Order status updated!")
        fetchAllData()
      } else {
        throw new Error("Failed to update order")
      }
    } catch (error) {
      console.error("Error updating order:", error)
      toast.error("Failed to update order")
    }
  }

  const generateInvoice = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/invoice`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `invoice-${orderId}.pdf`
        a.click()
        toast.success("Invoice downloaded!")
      } else {
        throw new Error("Failed to generate invoice")
      }
    } catch (error) {
      console.error("Error generating invoice:", error)
      toast.error("Failed to generate invoice")
    }
  }

  // Customer Management Functions
  const toggleCustomerStatus = async (customerId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        toast.success(`Customer ${isActive ? "activated" : "deactivated"}!`)
        fetchAllData()
      } else {
        throw new Error("Failed to update customer")
      }
    } catch (error) {
      console.error("Error updating customer:", error)
      toast.error("Failed to update customer")
    }
  }

  // Discount Management Functions
  const handleDiscountSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingDiscount ? `/api/admin/discounts/${editingDiscount.id}` : "/api/admin/discounts"
      const method = editingDiscount ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discountForm),
      })

      if (response.ok) {
        toast.success(editingDiscount ? "Discount updated!" : "Discount created!")
        setShowDiscountForm(false)
        setEditingDiscount(null)
        resetDiscountForm()
        fetchAllData()
      } else {
        throw new Error("Failed to save discount")
      }
    } catch (error) {
      console.error("Error saving discount:", error)
      toast.error("Failed to save discount")
    } finally {
      setLoading(false)
    }
  }

  const resetDiscountForm = () => {
    setDiscountForm({
      code: "",
      name: "",
      description: "",
      type: "PERCENTAGE",
      value: "",
      minAmount: "",
      maxUses: "",
      startDate: "",
      endDate: "",
      isActive: true,
    })
  }

  // Filter functions
  const filteredOrders = orders.filter((order) => {
    const matchesFilter = orderFilter === "all" || order.status.toLowerCase() === orderFilter.toLowerCase()
    const matchesSearch =
      order.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.id.toLowerCase().includes(orderSearch.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const lowStockProducts = products.filter((product) => product.stock <= product.lowStockThreshold)

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-light-blue/20 to-medium-blue/20 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-light-blue border-t-dark-blue rounded-full animate-spin"></div>
          <div
            className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-medium-blue rounded-full animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
          ></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-light-blue/20 to-medium-blue/20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-light-blue/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-3xl font-bold text-dark-blue">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-dark-blue hover:bg-light-blue/20 rounded-full transition-colors">
                <Bell className="w-6 h-6" />
                {lowStockProducts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {lowStockProducts.length}
                  </span>
                )}
              </button>
              <div className="flex space-x-2">
                {[
                  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
                  { id: "products", label: "Products", icon: Package },
                  { id: "orders", label: "Orders", icon: ShoppingCart },
                  { id: "customers", label: "Customers", icon: Users },
                  { id: "discounts", label: "Discounts", icon: Tag },
                  { id: "inventory", label: "Inventory", icon: AlertTriangle },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${
                      activeTab === tab.id ? "bg-medium-blue text-white" : "text-dark-blue hover:bg-light-blue/30"
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && analytics && (
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                {
                  title: "Total Sales",
                  value: `$${analytics.totalSales.toFixed(2)}`,
                  icon: DollarSign,
                  color: "bg-green-500",
                  change: "+12.5%",
                },
                {
                  title: "Total Orders",
                  value: analytics.totalOrders.toString(),
                  icon: ShoppingCart,
                  color: "bg-medium-blue",
                  change: "+8.2%",
                },
                {
                  title: "Customers",
                  value: analytics.totalCustomers.toString(),
                  icon: Users,
                  color: "bg-dark-blue",
                  change: "+15.3%",
                },
                {
                  title: "Today's Orders",
                  value: analytics.todayOrders.toString(),
                  icon: Clock,
                  color: "bg-orange-500",
                  change: "+5.1%",
                },
                {
                  title: "Low Stock Items",
                  value: analytics.lowStockProducts.toString(),
                  icon: AlertTriangle,
                  color: "bg-red-500",
                  change: "-2.3%",
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-light-blue/20 stagger-item"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-dark-blue mb-1">{stat.value}</h3>
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sales Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-light-blue/20">
                <h3 className="text-xl font-bold text-dark-blue mb-4">Sales Overview</h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <BarChart3 className="w-16 h-16" />
                  <span className="ml-4">Sales chart would be rendered here</span>
                </div>
              </div>

              {/* Order Status Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-light-blue/20">
                <h3 className="text-xl font-bold text-dark-blue mb-4">Order Status Distribution</h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <PieChart className="w-16 h-16" />
                  <span className="ml-4">Order status chart would be rendered here</span>
                </div>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-light-blue/20">
              <h3 className="text-xl font-bold text-dark-blue mb-4">Top Selling Products</h3>
              <div className="space-y-4">
                {analytics.topProducts.slice(0, 5).map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-light-blue/10 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-medium-blue rounded-full flex items-center justify-center text-white font-bold mr-4">
                        {index + 1}
                      </div>
                      <span className="font-medium text-dark-blue">{product.name}</span>
                    </div>
                    <span className="text-medium-blue font-bold">{product.sales} sold</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-dark-blue">Product Management</h2>
              <button
                onClick={() => setShowProductForm(true)}
                className="gradient-primary text-white px-6 py-3 rounded-xl hover:bg-dark-blue transition-all duration-300 flex items-center font-semibold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Product
              </button>
            </div>

            {/* Product Form Modal */}
            {showProductForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold text-dark-blue mb-6">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </h3>
                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-blue mb-2">Product Name</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-light-blue rounded-xl focus:ring-4 focus:ring-medium-blue/20 focus:border-medium-blue transition-all duration-300"
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-blue mb-2">Category</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-light-blue rounded-xl focus:ring-4 focus:ring-medium-blue/20 focus:border-medium-blue transition-all duration-300"
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-blue mb-2">Description</label>
                      <textarea
                        required
                        rows={3}
                        className="w-full px-4 py-3 border border-light-blue rounded-xl focus:ring-4 focus:ring-medium-blue/20 focus:border-medium-blue transition-all duration-300"
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-blue mb-2">Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          className="w-full px-4 py-3 border border-light-blue rounded-xl focus:ring-4 focus:ring-medium-blue/20 focus:border-medium-blue transition-all duration-300"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-blue mb-2">Stock Quantity</label>
                        <input
                          type="number"
                          required
                          className="w-full px-4 py-3 border border-light-blue rounded-xl focus:ring-4 focus:ring-medium-blue/20 focus:border-medium-blue transition-all duration-300"
                          value={productForm.stock}
                          onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-blue mb-2">Low Stock Alert</label>
                        <input
                          type="number"
                          required
                          className="w-full px-4 py-3 border border-light-blue rounded-xl focus:ring-4 focus:ring-medium-blue/20 focus:border-medium-blue transition-all duration-300"
                          value={productForm.lowStockThreshold}
                          onChange={(e) => setProductForm({ ...productForm, lowStockThreshold: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-blue mb-2">Image URL</label>
                      <input
                        type="url"
                        className="w-full px-4 py-3 border border-light-blue rounded-xl focus:ring-4 focus:ring-medium-blue/20 focus:border-medium-blue transition-all duration-300"
                        value={productForm.image}
                        onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center space-x-6">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2 w-4 h-4 text-medium-blue"
                          checked={productForm.featured}
                          onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                        />
                        <span className="text-sm font-medium text-dark-blue">Featured Product</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2 w-4 h-4 text-medium-blue"
                          checked={productForm.isActive}
                          onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
                        />
                        <span className="text-sm font-medium text-dark-blue">Active</span>
                      </label>
                    </div>

                    <div className="flex space-x-4 pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 gradient-primary text-white py-3 px-6 rounded-xl hover:bg-dark-blue transition-all duration-300 font-semibold disabled:opacity-50"
                      >
                        {loading ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowProductForm(false)
                          setEditingProduct(null)
                          resetProductForm()
                        }}
                        className="flex-1 border border-light-blue text-dark-blue py-3 px-6 rounded-xl hover:bg-light-blue/20 transition-all duration-300 font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-light-blue/20"
                >
                  <div className="aspect-square relative">
                    <Image
                      src={product.image || "/placeholder.svg?height=300&width=300"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4 flex flex-col space-y-2">
                      {product.featured && (
                        <span className="bg-medium-blue text-white px-2 py-1 rounded-full text-xs font-bold">
                          Featured
                        </span>
                      )}
                      {!product.isActive && (
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">Inactive</span>
                      )}
                      {product.stock <= product.lowStockThreshold && (
                        <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          Low Stock
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2 text-dark-blue">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500">Price:</span>
                        <span className="font-bold text-dark-blue ml-1">${product.price.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Stock:</span>
                        <span
                          className={`font-bold ml-1 ${product.stock <= product.lowStockThreshold ? "text-red-500" : "text-green-500"}`}
                        >
                          {product.stock}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Views:</span>
                        <span className="font-bold text-dark-blue ml-1">{product.views}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Sales:</span>
                        <span className="font-bold text-dark-blue ml-1">{product.sales}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="flex-1 bg-medium-blue text-white py-2 px-4 rounded-xl hover:bg-dark-blue transition-all duration-300 flex items-center justify-center"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex-1 bg-red-500 text-white py-2 px-4 rounded-xl hover:bg-red-600 transition-all duration-300 flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-2xl font-bold text-dark-blue">Order Management</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medium-blue w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    className="pl-10 pr-4 py-2 border border-light-blue rounded-xl focus:ring-4 focus:ring-medium-blue/20 focus:border-medium-blue transition-all duration-300"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                </div>
                <select
                  className="px-4 py-2 border border-light-blue rounded-xl focus:ring-4 focus:ring-medium-blue/20 focus:border-medium-blue transition-all duration-300 bg-white text-dark-blue"
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value)}
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-light-blue/20">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-light-blue/20">
                  <thead className="bg-light-blue/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-dark-blue uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-dark-blue uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-dark-blue uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-dark-blue uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-dark-blue uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-dark-blue uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-light-blue/10">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-light-blue/5 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-blue">
                          #{order.id.slice(-8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-dark-blue">{order.customerName}</div>
                            <div className="text-sm text-gray-500">{order.customerEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-dark-blue">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className={`text-xs font-semibold rounded-full px-3 py-1 border-0 ${
                              order.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "CONFIRMED"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "SHIPPED"
                                    ? "bg-purple-100 text-purple-800"
                                    : order.status === "DELIVERED"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                            }`}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="text-medium-blue hover:text-dark-blue transition-colors duration-200"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => generateInvoice(order.id)}
                              className="text-green-600 hover:text-green-800 transition-colors duration-200"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-dark-blue">Order Details</h3>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Order Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-dark-blue mb-2">Order Information</h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="text-gray-500">Order ID:</span> #{selectedOrder.id.slice(-8)}
                          </p>
                          <p>
                            <span className="text-gray-500">Date:</span>{" "}
                            {new Date(selectedOrder.createdAt).toLocaleDateString()}
                          </p>
                          <p>
                            <span className="text-gray-500">Status:</span> {selectedOrder.status}
                          </p>
                          <p>
                            <span className="text-gray-500">Total:</span> ${selectedOrder.total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-dark-blue mb-2">Customer Information</h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="text-gray-500">Name:</span> {selectedOrder.customerName}
                          </p>
                          <p>
                            <span className="text-gray-500">Email:</span> {selectedOrder.customerEmail}
                          </p>
                          <p>
                            <span className="text-gray-500">Phone:</span> {selectedOrder.customerPhone}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h4 className="font-semibold text-dark-blue mb-2">Shipping Address</h4>
                      <p className="text-sm text-gray-600 bg-light-blue/10 p-3 rounded-xl">
                        {selectedOrder.shippingAddress}
                      </p>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="font-semibold text-dark-blue mb-2">Order Items</h4>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item, index) => (
                          <div key={index} className="flex items-center space-x-4 p-3 bg-light-blue/10 rounded-xl">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                            <div className="flex-1">
                              <h5 className="font-medium text-dark-blue">{item.product.name}</h5>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-dark-blue">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {selectedOrder.notes && (
                      <div>
                        <h4 className="font-semibold text-dark-blue mb-2">Notes</h4>
                        <p className="text-sm text-gray-600 bg-light-blue/10 p-3 rounded-xl">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === "customers" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-dark-blue">Customer Management</h2>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-light-blue/20">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-light-blue/20">
                  <thead className="bg-light-blue/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-dark-blue uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-dark-blue uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-dark-blue uppercase tracking-wider">
                        Total Spent
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-dark-blue uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-dark-blue uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-dark-blue uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-light-blue/10">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-light-blue/5 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-dark-blue">{customer.name || "N/A"}</div>
                            <div className="text-sm text-gray-500">{customer.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-blue">{customer.orders.length}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-dark-blue">
                          ${customer.orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              customer.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {customer.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedCustomer(customer)}
                              className="text-medium-blue hover:text-dark-blue transition-colors duration-200"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleCustomerStatus(customer.id, !customer.isActive)}
                              className={`transition-colors duration-200 ${
                                customer.isActive
                                  ? "text-red-600 hover:text-red-800"
                                  : "text-green-600 hover:text-green-800"
                              }`}
                            >
                              {customer.isActive ? (
                                <XCircle className="w-4 h-4" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Customer Details Modal */}
            {selectedCustomer && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-dark-blue">Customer Details</h3>
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Customer Info */}
                    <div>
                      <h4 className="font-semibold text-dark-blue mb-2">Customer Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p>
                            <span className="text-gray-500">Name:</span> {selectedCustomer.name || "N/A"}
                          </p>
                          <p>
                            <span className="text-gray-500">Email:</span> {selectedCustomer.email}
                          </p>
                        </div>
                        <div>
                          <p>
                            <span className="text-gray-500">Status:</span>{" "}
                            {selectedCustomer.isActive ? "Active" : "Inactive"}
                          </p>
                          <p>
                            <span className="text-gray-500">Joined:</span>{" "}
                            {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order History */}
                    <div>
                      <h4 className="font-semibold text-dark-blue mb-2">Order History</h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {selectedCustomer.orders.map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between p-3 bg-light-blue/10 rounded-xl"
                          >
                            <div>
                              <p className="font-medium text-dark-blue">#{order.id.slice(-8)}</p>
                              <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-dark-blue">${order.total.toFixed(2)}</p>
                              <p className="text-sm text-gray-600">{order.status}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Discounts Tab */}
        {activeTab === "discounts" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-dark-blue">Discount Management</h2>
              <button
                onClick={() => setShowDiscountForm(true)}
                className="gradient-primary text-white px-6 py-3 rounded-xl hover:bg-dark-blue transition-all duration-300 flex items-center font-semibold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Discount
              </button>
            </div>

            {/* Discount Form Modal */}
            {showDiscountForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold text-dark-blue mb-6">
                    {editingDiscount ? "Edit Discount" : "Create New Discount"}
                  </h3>
                  <form onSubmit={handleDiscountSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-blue mb-2">Discount Code</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-light-blue rounded-xl focus:ring-4 focus:ring-medium-blue/20 focus:border-medium-blue transition-all duration-300"
                          value={discountForm.code}
                          onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase() })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-blue mb-2">Discount Name</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-light-blue rounded-xl focus:ring-4 focus:ring-medium-blue/20 focus:border-medium-blue transition-all duration-300"
                          value={discountForm.name}
                          onChange={(e) => setDiscountForm({ ...discountForm, name: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-blue mb-2">Description</label>
                      <textarea
                        rows={2}
                        className="w-full px-4 py-3 border border-light-blue rounded-xl focus:ring-4 focus:ring-medium-blue/20 focus:border-medium-blue transition-all duration-300"
                        value={discountForm.description}
                        onChange={(e) => setDiscountForm({ ...discountForm, description: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-blue mb-2">Type</label>
                        <select
                          className="w-full px-4 py-3 border border-light-blue rounded-xl focus:ring-4 focus:ring-medium-blue/20 focus:border-medium-blue transition-all duration-300 bg-white"
                          value={discountForm.type}
                          onChange={(e) => setDiscountForm({ ...discountForm, type: e.target.value })}
                        >
                          <option value="PERCENTAGE">Percentage</option>
                          <option value="FIXED_AMOUNT">Fixed Amount</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-blue mb-2">
                          Value {discountForm.type === "PERCENTAGE" ? "(%)" : "($)"}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          className="w-full px-4 py-3 border border-light-blue rounded-xl focus:ring-4 focus:ring-medium-blue/20 focus:border-medium-blue transition-all duration-300"
                          value={discountForm.value}
                          onChange={(e) => setDiscountForm({ ...discountForm, value: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-blue mb-2">Min Amount ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full px-4 py-3 border border-light-blue rounded-xl focus:ring-4 focus:ring-medium-blue/20 focus:border-medium-blue transition-all duration-300"
                          value={discountForm.minAmount}
                          onChange={(e) => setDiscountForm({ ...discountForm, minAmount: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-blue mb-2">Max Uses</label>
                        <input
                          type="number"
                          className="w-full px-4 py-3 border border-light-blue rounded-xl focus:ring-4 focus:ring-medium-blue/20 focus:border-medium-blue transition-all duration-300"
                          value={discountForm.maxUses}
                          onChange={(e) => setDiscountForm({ ...discountForm, maxUses: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-blue mb-2">Start Date</label>
                        <input
                          type="datetime-local"
                          required
                          className="w-full px-4 py-3 border border-light-blue rounded-xl focus:ring-4 focus:ring-medium-blue/20 focus:border-medium-blue transition-all duration-300"
                          value={discountForm.startDate}
                          onChange={(e) => setDiscountForm({ ...discountForm, startDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-blue mb-2">End Date</label>
                        <input
                          type="datetime-local"
                          required
                          className="w-full px-4 py-3 border border-light-blue rounded-xl focus:ring-4 focus:ring-medium-blue/20 focus:border-medium-blue transition-all duration-300"
                          value={discountForm.endDate}
                          onChange={(e) => setDiscountForm({ ...discountForm, endDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2 w-4 h-4 text-medium-blue"
                          checked={discountForm.isActive}
                          onChange={(e) => setDiscountForm({ ...discountForm, isActive: e.target.checked })}
                        />
                        <span className="text-sm font-medium text-dark-blue">Active</span>
                      </label>
                    </div>

                    <div className="flex space-x-4 pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 gradient-primary text-white py-3 px-6 rounded-xl hover:bg-dark-blue transition-all duration-300 font-semibold disabled:opacity-50"
                      >
                        {loading ? "Saving..." : editingDiscount ? "Update Discount" : "Create Discount"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDiscountForm(false)
                          setEditingDiscount(null)
                          resetDiscountForm()
                        }}
                        className="flex-1 border border-light-blue text-dark-blue py-3 px-6 rounded-xl hover:bg-light-blue/20 transition-all duration-300 font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Discounts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {discounts.map((discount) => (
                <div
                  key={discount.id}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-light-blue/20"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-dark-blue">{discount.name}</h3>
                      <p className="text-medium-blue font-mono text-sm">{discount.code}</p>
                    </div>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        discount.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {discount.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <p className="text-gray-600">{discount.description}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <span className="font-medium text-dark-blue ml-1">
                          {discount.type === "PERCENTAGE" ? "Percentage" : "Fixed Amount"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Value:</span>
                        <span className="font-bold text-dark-blue ml-1">
                          {discount.type === "PERCENTAGE" ? `${discount.value}%` : `$${discount.value}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Uses:</span>
                        <span className="font-medium text-dark-blue ml-1">
                          {discount.currentUses}/{discount.maxUses || "∞"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Min Amount:</span>
                        <span className="font-medium text-dark-blue ml-1">
                          {discount.minAmount ? `$${discount.minAmount}` : "None"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Valid:</span>
                      <span className="font-medium text-dark-blue ml-1">
                        {new Date(discount.startDate).toLocaleDateString()} -{" "}
                        {new Date(discount.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingDiscount(discount)
                        setDiscountForm({
                          code: discount.code,
                          name: discount.name,
                          description: discount.description || "",
                          type: discount.type,
                          value: discount.value.toString(),
                          minAmount: discount.minAmount?.toString() || "",
                          maxUses: discount.maxUses?.toString() || "",
                          startDate: new Date(discount.startDate).toISOString().slice(0, 16),
                          endDate: new Date(discount.endDate).toISOString().slice(0, 16),
                          isActive: discount.isActive,
                        })
                        setShowDiscountForm(true)
                      }}
                      className="flex-1 bg-medium-blue text-white py-2 px-4 rounded-xl hover:bg-dark-blue transition-all duration-300 flex items-center justify-center"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm("Are you sure you want to delete this discount?")) return
                        try {
                          const response = await fetch(`/api/admin/discounts/${discount.id}`, { method: "DELETE" })
                          if (response.ok) {
                            toast.success("Discount deleted!")
                            fetchAllData()
                          }
                        } catch (error) {
                          toast.error("Failed to delete discount")
                        }
                      }}
                      className="flex-1 bg-red-500 text-white py-2 px-4 rounded-xl hover:bg-red-600 transition-all duration-300 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === "inventory" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-dark-blue">Inventory Management</h2>

            {/* Low Stock Alert */}
            {lowStockProducts.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-orange-600 mr-2" />
                  <h3 className="text-lg font-bold text-orange-800">Low Stock Alert</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-xl p-4 border border-orange-200">
                      <h4 className="font-semibold text-dark-blue">{product.name}</h4>
                      <p className="text-sm text-gray-600">
                        Current Stock: <span className="font-bold text-red-500">{product.stock}</span>
                      </p>
                      <p className="text-sm text-gray-600">Threshold: {product.lowStockThreshold}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inventory Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-light-blue/20">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-light-blue/20">
                  <thead className="bg-light-blue/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-dark-blue uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-dark-blue uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-dark-blue uppercase tracking-wider">
                        Current Stock
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-dark-blue uppercase tracking-wider">
                        Low Stock Alert
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-dark-blue uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-dark-blue uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-light-blue/10">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-light-blue/5 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
                            <div>
                              <div className="text-sm font-medium text-dark-blue">{product.name}</div>
                              <div className="text-sm text-gray-500">${product.price.toFixed(2)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-blue">{product.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-sm font-bold ${
                              product.stock <= product.lowStockThreshold
                                ? "text-red-500"
                                : product.stock <= product.lowStockThreshold * 2
                                  ? "text-orange-500"
                                  : "text-green-500"
                            }`}
                          >
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-blue">
                          {product.lowStockThreshold}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.stock <= product.lowStockThreshold
                                ? "bg-red-100 text-red-800"
                                : product.stock <= product.lowStockThreshold * 2
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {product.stock <= product.lowStockThreshold
                              ? "Low Stock"
                              : product.stock <= product.lowStockThreshold * 2
                                ? "Medium Stock"
                                : "In Stock"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={async () => {
                              const newStock = prompt(`Update stock for ${product.name}:`, product.stock.toString())
                              if (newStock && !isNaN(Number(newStock))) {
                                try {
                                  const response = await fetch(`/api/admin/products/${product.id}/stock`, {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ stock: Number(newStock) }),
                                  })
                                  if (response.ok) {
                                    toast.success("Stock updated!")
                                    fetchAllData()
                                  }
                                } catch (error) {
                                  toast.error("Failed to update stock")
                                }
                              }
                            }}
                            className="text-medium-blue hover:text-dark-blue transition-colors duration-200"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
