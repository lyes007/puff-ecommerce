export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  stock: number
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return []
  const cart = localStorage.getItem("cart")
  return cart ? JSON.parse(cart) : []
}

export function saveCart(cart: CartItem[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem("cart", JSON.stringify(cart))
}

export function addToCart(product: Omit<CartItem, "quantity">): void {
  const cart = getCart()
  const existingItem = cart.find((item) => item.id === product.id)

  if (existingItem) {
    if (existingItem.quantity < product.stock) {
      existingItem.quantity += 1
    }
  } else {
    cart.push({ ...product, quantity: 1 })
  }

  saveCart(cart)
}

export function removeFromCart(productId: string): void {
  const cart = getCart().filter((item) => item.id !== productId)
  saveCart(cart)
}

export function updateCartQuantity(productId: string, quantity: number): void {
  const cart = getCart()
  const item = cart.find((item) => item.id === productId)

  if (item) {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      item.quantity = Math.min(quantity, item.stock)
      saveCart(cart)
    }
  }
}

export function clearCart(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("cart")
}

export function getCartTotal(cart: CartItem[]): number {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0)
}
