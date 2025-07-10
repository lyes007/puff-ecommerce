import Link from "next/link"
import Image from "next/image"
import { Star, Truck, Shield, Clock, Zap, Award, Users, Heart } from "lucide-react"
import Navigation from "@/components/navigation"
import { prisma } from "@/lib/db"

async function getFeaturedProducts() {
  try {
    return await prisma.product.findMany({
      where: { featured: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    console.error("Error fetching featured products:", error)
    return []
  }
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts()

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-light-blue/20 to-medium-blue/20">
      <Navigation />

      {/* Hero Section with Enhanced Animations */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 gradient-primary"></div>
        <div className="absolute inset-0 bg-dark-blue/20"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-cream/20 rounded-full animate-float"></div>
        <div
          className="absolute top-40 right-20 w-16 h-16 bg-light-blue/30 rounded-full animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-20 left-1/4 w-12 h-12 bg-medium-blue/30 rounded-full animate-float"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 animate-slide-in-top">
              <span className="block">Premium</span>
              <span className="block text-cream animate-pulse-custom">Puffs & Vapes</span>
            </h1>
            <p
              className="text-xl md:text-2xl mb-12 text-white/90 max-w-3xl mx-auto animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              Discover the finest quality with lightning-fast delivery and convenient pay-on-delivery options
            </p>
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up"
              style={{ animationDelay: "0.6s" }}
            >
              <Link
                href="/products"
                className="inline-flex items-center px-8 py-4 bg-cream text-dark-blue rounded-full font-bold text-lg hover:bg-white transition-all duration-300 hover-lift hover-glow group"
              >
                <Zap className="w-5 h-5 mr-2 group-hover:animate-bounce-custom" />
                Shop Now
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center px-8 py-4 border-2 border-cream text-cream rounded-full font-bold text-lg hover:bg-cream hover:text-dark-blue transition-all duration-300 hover-lift"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-cream relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-light-blue/10 to-medium-blue/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, number: "10K+", label: "Happy Customers" },
              { icon: Award, number: "500+", label: "Products Sold" },
              { icon: Truck, number: "24/7", label: "Fast Delivery" },
              { icon: Heart, number: "99%", label: "Satisfaction Rate" },
            ].map((stat, index) => (
              <div key={index} className="text-center stagger-item">
                <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-custom">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-dark-blue mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with Enhanced Design */}
      <section className="py-20 bg-gradient-to-br from-cream to-light-blue/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-dark-blue mb-6 animate-fade-in-up">
              Why Choose <span className="text-medium-blue">PuffShop</span>?
            </h2>
            <p
              className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              Experience the difference with our premium service and quality products
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Truck,
                title: "Lightning Fast Delivery",
                description: "Get your orders delivered in record time with our express shipping network",
                bgColor: "bg-light-blue",
                delay: "0s",
              },
              {
                icon: Shield,
                title: "Quality Guaranteed",
                description: "Premium products with rigorous quality testing and satisfaction guarantee",
                bgColor: "bg-medium-blue",
                delay: "0.2s",
              },
              {
                icon: Clock,
                title: "Pay on Delivery",
                description: "Convenient payment when you receive your order - no upfront payment needed",
                bgColor: "bg-dark-blue",
                delay: "0.4s",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover-lift animate-fade-in-up border border-light-blue/20"
                style={{ animationDelay: feature.delay }}
              >
                <div
                  className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce-custom transition-all duration-300`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-dark-blue mb-4 group-hover:text-medium-blue transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products with Enhanced Cards */}
      <section className="py-20 bg-gradient-to-br from-light-blue/20 to-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-dark-blue mb-6 animate-fade-in-up">
              Featured <span className="text-medium-blue">Products</span>
            </h2>
            <p
              className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              Discover our most popular and premium quality puffs and vapes
            </p>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product, index) => (
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
                    <div className="absolute top-4 right-4 bg-medium-blue text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse-custom">
                      Featured
                    </div>
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
                    <Link
                      href={`/products/${product.id}`}
                      className="w-full gradient-primary text-white py-3 px-6 rounded-xl hover:bg-dark-blue transition-all duration-300 text-center block font-semibold hover-glow group-hover:animate-pulse-custom"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-custom">
                <Zap className="w-12 h-12 text-white" />
              </div>
              <p className="text-gray-600 text-xl mb-8">No featured products available at the moment.</p>
              <Link
                href="/products"
                className="inline-block gradient-primary text-white px-8 py-4 rounded-xl hover:bg-dark-blue transition-all duration-300 font-semibold hover-lift"
              >
                Browse All Products
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-dark-blue/20"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-cream/10 rounded-full animate-float"></div>
        <div
          className="absolute bottom-10 right-10 w-24 h-24 bg-light-blue/20 rounded-full animate-float"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in-up">Stay Updated</h2>
          <p className="text-xl text-cream/90 mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Get the latest updates on new products and exclusive offers
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-xl border-0 focus:ring-4 focus:ring-cream/30 text-gray-900 placeholder-gray-500"
            />
            <button className="px-8 py-4 bg-cream text-dark-blue rounded-xl font-bold hover:bg-white transition-all duration-300 hover-lift">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-dark-blue text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-medium-blue/20 to-light-blue/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="animate-fade-in-up">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 gradient-secondary rounded-full flex items-center justify-center animate-glow">
                  <Zap className="text-dark-blue w-5 h-5" />
                </div>
                <span className="text-2xl font-bold text-cream">PuffShop</span>
              </div>
              <p className="text-light-blue leading-relaxed">
                Your trusted source for premium puffs and vapes with guaranteed quality and lightning-fast delivery.
              </p>
            </div>

            {[
              {
                title: "Quick Links",
                links: [
                  { href: "/products", label: "Products" },
                  { href: "/about", label: "About Us" },
                  { href: "/contact", label: "Contact" },
                  { href: "/faq", label: "FAQ" },
                ],
              },
              {
                title: "Customer Service",
                links: [
                  { href: "/shipping", label: "Shipping Info" },
                  { href: "/returns", label: "Returns" },
                  { href: "/support", label: "Support" },
                  { href: "/track", label: "Track Order" },
                ],
              },
              {
                title: "Contact Info",
                links: [
                  { href: "mailto:support@puffshop.com", label: "support@puffshop.com" },
                  { href: "tel:+15551234567", label: "(555) 123-4567" },
                  { href: "#", label: "Mon-Fri 9AM-6PM" },
                  { href: "#", label: "24/7 Online Support" },
                ],
              },
            ].map((section, index) => (
              <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${(index + 1) * 0.1}s` }}>
                <h3 className="text-lg font-semibold mb-6 text-cream">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="text-light-blue hover:text-cream transition-colors duration-300 hover:translate-x-1 inline-block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            className="border-t border-medium-blue/30 pt-8 text-center animate-fade-in-up"
            style={{ animationDelay: "0.6s" }}
          >
            <p className="text-light-blue">
              &copy; 2024 PuffShop. All rights reserved. Made with ❤️ for vaping enthusiasts.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
