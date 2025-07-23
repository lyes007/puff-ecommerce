"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Menu, X, Search } from "lucide-react"
import { getCart } from "@/lib/cart"

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartItemCount, setCartItemCount] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const updateCartCount = () => {
      const cart = getCart()
      const count = cart.reduce((total, item) => total + item.quantity, 0)
      setCartItemCount(count)
    }

    updateCartCount()

    // Listen for cart updates
    const handleStorageChange = () => updateCartCount()
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("cartUpdated", handleStorageChange)

    // Handle scroll effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("cartUpdated", handleStorageChange)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <>
      {/* Moving Banner */}
      <div className="moving-banner text-white py-2 text-sm font-medium">
        <div className="moving-text">
          🚚 FREE DELIVERY ON ALL ORDERS • 💨 PREMIUM QUALITY PUFFS • 🔥 PAY ON DELIVERY AVAILABLE • ⚡ FAST SHIPPING •
          🚚 FREE DELIVERY ON ALL ORDERS • 💨 PREMIUM QUALITY PUFFS • 🔥 PAY ON DELIVERY AVAILABLE • ⚡ FAST SHIPPING •
        </div>
      </div>

      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-cream/95 backdrop-blur-md shadow-lg border-b border-light-blue" : "bg-cream shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-10 h-10 animate-glow group-hover:animate-pulse-custom transition-all duration-300">
                <Image src="/puff-planete-logo.png" alt="Puff Planete Logo" fill className="object-contain" />
              </div>
              <span className="text-2xl font-bold text-dark-blue">Puff Planete</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {[
                { href: "/", label: "Home" },
              ].map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative text-gray-700 hover:text-dark-blue transition-all duration-300 font-medium group animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-medium-blue transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-700 hover:text-dark-blue transition-all duration-300 hover:bg-light-blue/30 rounded-full hover-scale">
                <Search className="w-5 h-5" />
              </button>

              <Link
                href="/cart"
                className="relative p-2 text-gray-700 hover:text-dark-blue transition-all duration-300 hover:bg-light-blue/30 rounded-full hover-scale group"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-bounce-custom group-hover:animate-pulse-custom">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 text-gray-700 hover:text-dark-blue transition-all duration-300 hover:bg-light-blue/30 rounded-full"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div
            className={`md:hidden transition-all duration-300 overflow-hidden ${
              isMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="py-4 border-t border-light-blue">
              <div className="flex flex-col space-y-4">
                {[
                  { href: "/", label: "Home" },
                ].map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-gray-700 hover:text-dark-blue transition-all duration-300 font-medium py-2 px-4 rounded-lg hover:bg-light-blue/30 animate-fade-in-left"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
