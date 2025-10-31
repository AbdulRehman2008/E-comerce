import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart_items')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('cart_items', JSON.stringify(items))
    } catch {
      /* ignore */
    }
  }, [items])

  const addToCart = (product, quantity = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(p => p.id === product.id)
      if (idx !== -1) {
        const next = [...prev]
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity }
        return next
      }
      return [...prev, { ...product, quantity }]
    })
  }

  const removeFromCart = (productId) => {
    setItems(prev => prev.filter(p => p.id !== productId))
  }

  const setQuantity = (productId, quantity) => {
    setItems(prev => prev.map(p => p.id === productId ? { ...p, quantity: Math.max(1, quantity) } : p))
  }

  const clearCart = () => setItems([])

  const cartCount = useMemo(() => items.reduce((sum, p) => sum + p.quantity, 0), [items])
  const subtotal = useMemo(() => items.reduce((sum, p) => sum + p.price * p.quantity, 0), [items])

  const value = {
    items,
    addToCart,
    removeFromCart,
    setQuantity,
    clearCart,
    cartCount,
    subtotal,
  }

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}


