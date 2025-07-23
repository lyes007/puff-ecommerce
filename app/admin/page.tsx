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
  ImageIcon,
  X,
  GripVertical,
  Copy,
  Settings,
} from "lucide-react"
import Image from "next/image"
import toast from "react-hot-toast"

interface ProductImage {
  id?: string
  url: string
  alt?: string
  isPrimary: boolean
  order: number
}

interface ProductVariant {
  id?: string
  name: string
  value: string
  price?: number
  stock: number
  sku?: string
  isActive: boolean
  order: number
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  lowStockThreshold: number
  featured: boolean
  isActive: boolean
  views: number
  sales: number
  createdAt: string
  gallery?: ProductImage[]
  variants?: ProductVariant[]
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
      gallery?: ProductImage[]
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
    category: "",
    stock: "",
    lowStockThreshold: "10",
    featured: false,
    isActive: true,
  })

  // Gallery Management States
  const [productGallery, setProductGallery] = useState<ProductImage[]>([])
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null)

  // Add these new state variables after the existing state declarations (around line 100):
  const [uploadingImage, setUploadingImage] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  // Variant Management States
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([])
  const [showVariantForm, setShowVariantForm] = useState(false)
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null)
  const [variantForm, setVariantForm] = useState({
    name: "",
    value: "",
    price: "",
    stock: "",
    sku: "",
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

  // Gallery Management Functions
  // Update the addImageToGallery function to show both options:
  const addImageToGallery = () => {
    const choice = confirm("Choose upload method:\nOK = Upload from device\nCancel = Enter URL")

    if (choice) {
      // Trigger file input
      const fileInput = document.getElementById("imageUpload") as HTMLInputElement
      fileInput?.click()
    } else {
      // URL input
      const url = prompt("Enter image URL:")
      if (url) {
        const newImage: ProductImage = {
          url,
          alt: "",
          isPrimary: productGallery.length === 0,
          order: productGallery.length,
        }
        setProductGallery([...productGallery, newImage])
      }
    }
  }

  const removeImageFromGallery = (index: number) => {
    const newGallery = productGallery.filter((_, i) => i !== index)
    // If we removed the primary image, make the first one primary
    if (productGallery[index].isPrimary && newGallery.length > 0) {
      newGallery[0].isPrimary = true
    }
    // Reorder the remaining images
    newGallery.forEach((img, i) => {
      img.order = i
    })
    setProductGallery(newGallery)
  }

  const setPrimaryImage = (index: number) => {
    const newGallery = productGallery.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }))
    setProductGallery(newGallery)
  }

  const updateImageAlt = (index: number, alt: string) => {
    const newGallery = [...productGallery]
    newGallery[index].alt = alt
    setProductGallery(newGallery)
  }

  const handleImageDragStart = (index: number) => {
    setDraggedImageIndex(index)
  }

  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleImageDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedImageIndex === null) return

    const newGallery = [...productGallery]
    const draggedImage = newGallery[draggedImageIndex]
    newGallery.splice(draggedImageIndex, 1)
    newGallery.splice(dropIndex, 0, draggedImage)

    // Update order values
    newGallery.forEach((img, i) => {
      img.order = i
    })

    setProductGallery(newGallery)
    setDraggedImageIndex(null)
  }

  // Add these new functions after the existing gallery management functions (around line 200):

  // File upload handler
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast.error("Image size should be less than 5MB")
      return
    }

    setUploadingImage(true)

    try {
      // Convert file to base64 for demo purposes
      // In production, you'd upload to a service like Cloudinary, AWS S3, or Vercel Blob
      const base64 = await fileToBase64(file)

      const newImage: ProductImage = {
        url: base64,
        alt: file.name.split(".")[0],
        isPrimary: productGallery.length === 0,
        order: productGallery.length,
      }

      setProductGallery([...productGallery, newImage])
      toast.success("Image uploaded successfully!")
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image")
    } finally {
      setUploadingImage(false)
    }
  }

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => handleImageUpload(file))
    }
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => handleImageUpload(file))
    }
  }

  // Variant Management Functions
  const addVariant = () => {
    if (editingVariantIndex !== null) {
      // Update existing variant
      const newVariants = [...productVariants]
      newVariants[editingVariantIndex] = {
        ...variantForm,
        price: variantForm.price ? Number.parseFloat(variantForm.price) : undefined,
        stock: Number.parseInt(variantForm.stock) || 0,
        order: editingVariantIndex,
      }
      setProductVariants(newVariants)
      setEditingVariantIndex(null)
    } else {
      // Add new variant
      const newVariant: ProductVariant = {
        ...variantForm,
        price: variantForm.price ? Number.parseFloat(variantForm.price) : undefined,
        stock: Number.parseInt(variantForm.stock) || 0,
        order: productVariants.length,
      }
      setProductVariants([...productVariants, newVariant])
    }

    setVariantForm({
      name: "",
      value: "",
      price: "",
      stock: "",
      sku: "",
      isActive: true,
    })
    setShowVariantForm(false)
  }

  const editVariant = (index: number) => {
    const variant = productVariants[index]
    setVariantForm({
      name: variant.name,
      value: variant.value,
      price: variant.price?.toString() || "",
      stock: variant.stock.toString(),
      sku: variant.sku || "",
      isActive: variant.isActive,
    })
    setEditingVariantIndex(index)
    setShowVariantForm(true)
  }

  const removeVariant = (index: number) => {
    const newVariants = productVariants.filter((_, i) => i !== index)
    // Reorder remaining variants
    newVariants.forEach((variant, i) => {
      variant.order = i
    })
    setProductVariants(newVariants)
  }

  const duplicateVariant = (index: number) => {
    const variant = productVariants[index]
    const newVariant: ProductVariant = {
      ...variant,
      id: undefined, // Remove ID so it's treated as new
      value: `${variant.value} (Copy)`,
      order: productVariants.length,
    }
    setProductVariants([...productVariants, newVariant])
  }

  // Product Management Functions
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const productData = {
        ...productForm,
        gallery: productGallery,
        variants: productVariants,
      }

      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : "/api/admin/products"
      const method = editingProduct ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
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
      category: product.category,
      stock: product.stock.toString(),
      lowStockThreshold: product.lowStockThreshold.toString(),
      featured: product.featured,
      isActive: product.isActive,
    })
    setProductGallery(product.gallery || [])
    setProductVariants(product.variants || [])
    setShowProductForm(true)
  }

  const resetProductForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      lowStockThreshold: "10",
      featured: false,
      isActive: true,
    })
    setProductGallery([])
    setProductVariants([])
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
                  value: `TND ${analytics.totalSales.toFixed(2)}`,
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

            {/* Enhanced Product Form Modal */}
            {showProductForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-light-blue/20 p-6 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-bold text-dark-blue">
                        {editingProduct ? "Edit Product" : "Add New Product"}
                      </h3>
                      <button
                        onClick={() => {
                          setShowProductForm(false)
                          setEditingProduct(null)
                          resetProductForm()
                        }}
                        className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleProductSubmit} className="p-6 space-y-8">
                    {/* Basic Product Information */}
                    <div className="bg-light-blue/10 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-dark-blue mb-4 flex items-center">
                        <Settings className="w-5 h-5 mr-2" />
                        Basic Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                      <div className="mt-6">
                        <label className="block text-sm font-medium text-dark-blue mb-2">Description</label>
                        <textarea
                          required
                          rows={4}
                          className="w-full px-4 py-3 border border-light-blue rounded-xl focus:ring-4 focus:ring-medium-blue/20 focus:border-medium-blue transition-all duration-300"
                          value={productForm.description}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div>
                          <label className="block text-sm font-medium text-dark-blue mb-2">Price (TND)</label>
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

                      <div className="flex items-center space-x-6 mt-6">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-2 w-4 h-4 text-medium-blue rounded focus:ring-medium-blue"
                            checked={productForm.featured}
                            onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                          />
                          <span className="text-sm font-medium text-dark-blue">Featured Product</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-2 w-4 h-4 text-medium-blue rounded focus:ring-medium-blue"
                            checked={productForm.isActive}
                            onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
                          />
                          <span className="text-sm font-medium text-dark-blue">Active</span>
                        </label>
                      </div>
                    </div>

                    {/* Photo Gallery Management */}
                    <div className="bg-medium-blue/10 rounded-2xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold text-dark-blue flex items-center">
                          <ImageIcon className="w-5 h-5 mr-2" />
                          Photo Gallery
                        </h4>
                        <div className="flex space-x-2">
                          <input
                            type="file"
                            id="imageUpload"
                            multiple
                            accept="image/*"
                            onChange={handleFileInputChange}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById("imageUpload")?.click()}
                            disabled={uploadingImage}
                            className="bg-medium-blue text-white px-4 py-2 rounded-lg hover:bg-dark-blue transition-colors flex items-center text-sm disabled:opacity-50"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            {uploadingImage ? "Uploading..." : "Upload Images"}
                          </button>
                          <button
                            type="button"
                            onClick={addImageToGallery}
                            className="bg-light-blue text-dark-blue px-4 py-2 rounded-lg hover:bg-medium-blue hover:text-white transition-colors flex items-center text-sm"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add URL
                          </button>
                        </div>
                      </div>

                      {productGallery.length === 0 ? (
                        <div
                          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                            dragOver ? "border-medium-blue bg-medium-blue/10" : "border-light-blue"
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleFileDrop}
                        >
                          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 mb-4">No images added yet</p>
                          <p className="text-sm text-gray-400 mb-4">Drag and drop images here or click to upload</p>
                          <div className="flex justify-center space-x-4">
                            <button
                              type="button"
                              onClick={() => document.getElementById("imageUpload")?.click()}
                              disabled={uploadingImage}
                              className="bg-medium-blue text-white px-6 py-2 rounded-lg hover:bg-dark-blue transition-colors disabled:opacity-50"
                            >
                              {uploadingImage ? "Uploading..." : "Upload from Device"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const url = prompt("Enter image URL:")
                                if (url) {
                                  const newImage: ProductImage = {
                                    url,
                                    alt: "",
                                    isPrimary: productGallery.length === 0,
                                    order: productGallery.length,
                                  }
                                  setProductGallery([...productGallery, newImage])
                                }
                              }}
                              className="bg-light-blue text-dark-blue px-6 py-2 rounded-lg hover:bg-medium-blue hover:text-white transition-colors"
                            >
                              Add from URL
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {/* Upload Zone */}
                          <div
                            className={`border-2 border-dashed rounded-xl p-4 mb-4 text-center transition-colors ${
                              dragOver ? "border-medium-blue bg-medium-blue/10" : "border-light-blue/50"
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleFileDrop}
                          >
                            <p className="text-sm text-gray-500">
                              Drag and drop more images here or click upload button
                            </p>
                          </div>

                          {/* Images Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {productGallery.map((image, index) => (
                              <div
                                key={index}
                                className="relative group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                                draggable
                                onDragStart={() => handleImageDragStart(index)}
                                onDragOver={handleImageDragOver}
                                onDrop={(e) => handleImageDrop(e, index)}
                              >
                                <div className="aspect-square relative">
                                  <Image
                                    src={image.url || "/placeholder.svg?height=200&width=200"}
                                    alt={image.alt || `Product image ${index + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                                      <button
                                        type="button"
                                        onClick={() => setPrimaryImage(index)}
                                        className={`p-2 rounded-full ${
                                          image.isPrimary
                                            ? "bg-green-500 text-white"
                                            : "bg-white text-gray-700 hover:bg-green-500 hover:text-white"
                                        } transition-colors`}
                                        title="Set as primary"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => removeImageFromGallery(index)}
                                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                        title="Remove image"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                  {image.isPrimary && (
                                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                      Primary
                                    </div>
                                  )}
                                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded cursor-move">
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                </div>
                                <div className="p-3">
                                  <input
                                    type="text"
                                    placeholder="Alt text (optional)"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-medium-blue/20 focus:border-medium-blue transition-all duration-300"
                                    value={image.alt || ""}
                                    onChange={(e) => updateImageAlt(index, e.target.value)}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Product Variations */}
                    <div className="bg-dark-blue/10 rounded-2xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold text-dark-blue flex items-center">
                          <Settings className="w-5 h-5 mr-2" />
                          Product Variations
                        </h4>
                        <button
                          type="button"
                          onClick={() => setShowVariantForm(true)}
                          className="bg-dark-blue text-white px-4 py-2 rounded-lg hover:bg-medium-blue transition-colors flex items-center text-sm"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Variation
                        </button>
                      </div>

                      {/* Variant Form */}
                      {showVariantForm && (
                        <div className="bg-white rounded-xl p-4 mb-4 border border-light-blue">
                          <h5 className="font-semibold text-dark-blue mb-3">
                            {editingVariantIndex !== null ? "Edit Variation" : "Add New Variation"}
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Variation Name</label>
                              <input
                                type="text"
                                placeholder="e.g., Color, Size, Flavor"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medium-blue/20 focus:border-medium-blue transition-all duration-300"
                                value={variantForm.name}
                                onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                              <input
                                type="text"
                                placeholder="e.g., Red, Large, Mint"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medium-blue/20 focus:border-medium-blue transition-all duration-300"
                                value={variantForm.value}
                                onChange={(e) => setVariantForm({ ...variantForm, value: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price Adjustment (TND)
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                placeholder="Optional"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medium-blue/20 focus:border-medium-blue transition-all duration-300"
                                value={variantForm.price}
                                onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                              <input
                                type="number"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medium-blue/20 focus:border-medium-blue transition-all duration-300"
                                value={variantForm.stock}
                                onChange={(e) => setVariantForm({ ...variantForm, stock: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                              <input
                                type="text"
                                placeholder="Optional"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medium-blue/20 focus:border-medium-blue transition-all duration-300"
                                value={variantForm.sku}
                                onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
                              />
                            </div>
                            <div className="flex items-center">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="mr-2 w-4 h-4 text-medium-blue rounded focus:ring-medium-blue"
                                  checked={variantForm.isActive}
                                  onChange={(e) => setVariantForm({ ...variantForm, isActive: e.target.checked })}
                                />
                                <span className="text-sm font-medium text-gray-700">Active</span>
                              </label>
                            </div>
                          </div>
                          <div className="flex space-x-3 mt-4">
                            <button
                              type="button"
                              onClick={addVariant}
                              className="bg-medium-blue text-white px-4 py-2 rounded-lg hover:bg-dark-blue transition-colors text-sm"
                            >
                              {editingVariantIndex !== null ? "Update" : "Add"} Variation
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowVariantForm(false)
                                setEditingVariantIndex(null)
                                setVariantForm({
                                  name: "",
                                  value: "",
                                  price: "",
                                  stock: "",
                                  sku: "",
                                  isActive: true,
                                })
                              }}
                              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Variants List */}
                      {productVariants.length === 0 ? (
                        <div className="border-2 border-dashed border-light-blue rounded-xl p-8 text-center">
                          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 mb-4">No variations added yet</p>
                          <button
                            type="button"
                            onClick={() => setShowVariantForm(true)}
                            className="bg-light-blue text-dark-blue px-6 py-2 rounded-lg hover:bg-medium-blue hover:text-white transition-colors"
                          >
                            Add First Variation
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {productVariants.map((variant, index) => (
                            <div
                              key={index}
                              className="bg-white rounded-xl p-4 border border-light-blue hover:shadow-md transition-all duration-300"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                  <div>
                                    <span className="text-sm text-gray-500">Name</span>
                                    <p className="font-medium text-dark-blue">{variant.name}</p>
                                  </div>
                                  <div>
                                    <span className="text-sm text-gray-500">Value</span>
                                    <p className="font-medium text-dark-blue">{variant.value}</p>
                                  </div>
                                  <div>
                                    <span className="text-sm text-gray-500">Price/Stock</span>
                                    <p className="font-medium text-dark-blue">
                                      {variant.price
                                        ? `+TND ${variant.price}`
                                        : "Base price"} / {variant.stock} units
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-sm text-gray-500">Status</span>
                                    <p
                                      className={`font-medium ${variant.isActive ? "text-green-600" : "text-red-600"}`}
                                    >
                                      {variant.isActive ? "Active" : "Inactive"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex space-x-2 ml-4">
                                  <button
                                    type="button"
                                    onClick={() => editVariant(index)}
                                    className="p-2 text-medium-blue hover:bg-medium-blue hover:text-white rounded-lg transition-colors"
                                    title="Edit variation"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => duplicateVariant(index)}
                                    className="p-2 text-gray-600 hover:bg-gray-600 hover:text-white rounded-lg transition-colors"
                                    title="Duplicate variation"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeVariant(index)}
                                    className="p-2 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                                    title="Remove variation"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex space-x-4 pt-4 border-t border-light-blue/20">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 gradient-primary text-white py-4 px-6 rounded-xl hover:bg-dark-blue transition-all duration-300 font-semibold disabled:opacity-50 text-lg"
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
                        className="flex-1 border-2 border-light-blue text-dark-blue py-4 px-6 rounded-xl hover:bg-light-blue/20 transition-all duration-300 font-semibold text-lg"
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
                      src={
                        product.gallery?.find((img) => img.isPrimary)?.url ||
                        product.gallery?.[0]?.url ||
                        "/placeholder.svg?height=300&width=300" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg"
                      }
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
                    {product.gallery && product.gallery.length > 1 && (
                      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                        +{product.gallery.length - 1} more
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2 text-dark-blue">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500">Price:</span>
                        <span className="font-bold text-dark-blue ml-1">TND {product.price.toFixed(2)}</span>
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
                        <span className="text-gray-500">Variants:</span>
                        <span className="font-bold text-dark-blue ml-1">{product.variants?.length || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Images:</span>
                        <span className="font-bold text-dark-blue ml-1">{product.gallery?.length || 0}</span>
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

        {/* Other tabs remain the same... */}
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
                          <span className="font-semibold">TND {order.total.toFixed(2)}</span>
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
                            <span className="text-gray-500">Total:</span> TND {selectedOrder.total.toFixed(2)}
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
                            <div className="w-12 h-12 bg-gray-200 rounded-lg relative">
                              <Image
                                src={
                                  item.product.gallery?.find((img) => img.isPrimary)?.url ||
                                  item.product.gallery?.[0]?.url ||
                                  "/placeholder.svg?height=48&width=48" ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg"
                                }
                                alt={item.product.name}
                                fill
                                className="object-cover rounded-lg"
                              />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-dark-blue">{item.product.name}</h5>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-dark-blue">TND {(item.price * item.quantity).toFixed(2)}</p>
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

        {/* Continue with other tabs... */}
      </div>
    </div>
  )
}
