import Link from "next/link"
import Image from "next/image"
import { Star, Zap, AlertTriangle } from "lucide-react"
import Navigation from "@/components/navigation"
import { prisma } from "@/lib/db"

async function getAllProducts() {
  try {
    return await prisma.product.findMany({
      include: {
        gallery: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

export default async function ProductsPage() {
  const products = await getAllProducts()

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-light-blue/20 to-medium-blue/20">
      <Navigation />

      <section className="py-20 bg-gradient-to-br from-light-blue/20 to-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-dark-blue mb-6 animate-fade-in-up">
              All <span className="text-medium-blue">Products</span>
            </h1>
            <p
              className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              Browse our full collection of products
            </p>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover-lift stagger-item border border-light-blue/20"
                >
                  <div className="aspect-square relative overflow-hidden image-container">
                    <Image
                      src={
                        product.gallery?.find((img) => img.isPrimary)?.url ||
                        product.gallery?.[0]?.url ||
                        "/placeholder.svg?height=300&width=300" ||
                        "/placeholder.svg"
                      }
                      alt={product.gallery?.find((img) => img.isPrimary)?.alt || product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-3 text-dark-blue group-hover:text-medium-blue transition-colors duration-300 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl font-bold text-dark-blue">TND {product.price.toFixed(2)}</span>
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
              <p className="text-gray-600 text-xl mb-8">No products available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Enhanced Footer with Responsible Messaging */}
      <footer className="bg-dark-blue text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-medium-blue/20 to-light-blue/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="animate-fade-in-up">
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative w-10 h-10 animate-glow">
                  <Image
                    src="/placeholder.svg?height=40&width=40&text=PW"
                    alt="Puff World Logo"
                    fill
                    className="object-contain rounded-full"
                  />
                </div>
                <span className="text-2xl font-bold text-cream">Puff World</span>
              </div>
              <p className="text-light-blue leading-relaxed mb-4">
                Supporting adult smokers on their journey to quit with responsible alternatives and honest information.
              </p>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <h3 className="text-lg font-semibold mb-6 text-cream">Quick Links</h3>
              <ul className="space-y-3">
                {[
                  { href: "/products", label: "Products" },
                  { href: "/about", label: "About Us" },
                  { href: "/contact", label: "Contact" },
                  { href: "/resources", label: "Quit Resources" },
                ].map((link, linkIndex) => (
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

            {/* Responsible Use Information */}
            <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <h3 className="text-lg font-semibold mb-6 text-cream flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Health & Responsibility
              </h3>
              <div className="bg-orange-900/30 border border-orange-700/50 rounded-xl p-4 mb-4">
                <p className="text-orange-200 text-sm leading-relaxed mb-3">
                  <strong>⚠️ Important:</strong> This platform is designed for adult smokers seeking safer alternatives
                  as part of their journey to quit smoking.
                </p>
                <p className="text-orange-200 text-sm leading-relaxed mb-3">
                  Vaping products are harmful and should only be used as a last resort under medical guidance. They are
                  not risk-free and should never be used by non-smokers, youth, or pregnant individuals.
                </p>
                <p className="text-orange-200 text-sm leading-relaxed">
                  <strong>📿 Islamic Perspective:</strong> Your health is a trust (Amanah) from Allah. Protecting it is
                  not only a choice — it is a responsibility.
                </p>
              </div>
              <div className="text-xs text-light-blue/80">
                <p className="mb-2">We also provide resources on:</p>
                <ul className="space-y-1 ml-4">
                  <li>• Medically approved alternatives</li>
                  <li>• Behavioral support for quitting</li>
                  <li>• Health risks education</li>
                  <li>• Spiritual guidance for recovery</li>
                </ul>
              </div>
            </div>
          </div>

          <div
            className="border-t border-medium-blue/30 pt-8 text-center animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <p className="text-light-blue mb-2">
              &copy; 2024 Puff World. All rights reserved. Supporting responsible choices for adult smokers.
            </p>
            <p className="text-xs text-light-blue/70">
              This platform promotes harm reduction, not recreational vaping. Age verification required.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
