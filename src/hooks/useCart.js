import { useState, useCallback } from 'react'

export function useCart() {
  const [cartItems, setCartItems] = useState([])

  const addToCart = useCallback((product, qty = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, qty: item.qty + qty }
            : item
        )
      }
      return [...prev, { ...product, qty }]
    })
  }, [])

  const removeFromCart = useCallback((productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId))
  }, [])

  const updateQty = useCallback((productId, qty) => {
    if (qty < 1) return
    setCartItems(prev =>
      prev.map(item => item.id === productId ? { ...item, qty } : item)
    )
  }, [])

  const clearCart = useCallback(() => setCartItems([]), [])

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0)
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)

  return { cartItems, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal }
}