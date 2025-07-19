export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  stock: number
  selectedVariation?: {
    id?: string
    name: string
    value: string
    price?: number
  }
  variationId?: string
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

export function addToCart(
  product: Omit<CartItem, "quantity">,
  selectedVariation?: { id?: string; name: string; value: string; price?: number },
): void {
  const cart = getCart()

  // Create unique identifier for product + variation combination
  const cartItemKey = selectedVariation
    ? `${product.id}-${selectedVariation.id || selectedVariation.value}`
    : product.id

  const existingItem = cart.find((item) => {
    const itemKey = item.selectedVariation
      ? `${item.id}-${item.selectedVariation.id || item.selectedVariation.value}`
      : item.id
    return itemKey === cartItemKey
  })

  if (existingItem) {
    if (existingItem.quantity < product.stock) {
      existingItem.quantity += 1
    }
  } else {
    const newItem: CartItem = {
      ...product,
      quantity: 1,
      selectedVariation,
      variationId: selectedVariation?.id,
    }
    cart.push(newItem)
  }

  saveCart(cart)
}

export function removeFromCart(productId: string): void {
  const cart = getCart().filter((item) => {
    const itemKey = item.selectedVariation
      ? `${item.id}-${item.selectedVariation.id || item.selectedVariation.value}`
      : item.id
    return itemKey !== productId
  })
  saveCart(cart)
}

export function updateCartQuantity(productId: string, quantity: number): void {
  const cart = getCart()
  const item = cart.find((item) => {
    const itemKey = item.selectedVariation
      ? `${item.id}-${item.selectedVariation.id || item.selectedVariation.value}`
      : item.id
    return itemKey === productId
  })

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
