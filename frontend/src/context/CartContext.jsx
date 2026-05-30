import { createContext, useContext, useReducer, useCallback, useEffect } from 'react'

const CartContext = createContext(null)

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      const existing = state.find((i) => i.product_id === action.payload.product_id)
      if (existing) {
        return state.map((i) =>
          i.product_id === action.payload.product_id
            ? { ...i, quantity: i.quantity + (action.payload.quantity || 1) }
            : i
        )
      }
      return [...state, { ...action.payload, quantity: action.payload.quantity || 1 }]
    case 'REMOVE':
      return state.filter((i) => i.product_id !== action.payload.product_id)
    case 'UPDATE_QUANTITY':
      if (action.payload.quantity < 1) {
        return state.filter((i) => i.product_id !== action.payload.product_id)
      }
      return state.map((i) =>
        i.product_id === action.payload.product_id ? { ...i, quantity: action.payload.quantity } : i
      )
    case 'CLEAR':
      return []
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [], (init) => {
    try {
      const saved = localStorage.getItem('greengrow_cart')
      return saved ? JSON.parse(saved) : init
    } catch {
      return init
    }
  })

  // Persist cart to localStorage when it changes
  const addToCart = useCallback((item) => {
    dispatch({ type: 'ADD', payload: item })
  }, [])

  const removeFromCart = useCallback((productId) => {
    dispatch({ type: 'REMOVE', payload: { product_id: productId } })
  }, [])

  const updateQuantity = useCallback((productId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { product_id: productId, quantity } })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR' })
  }, [])

  useEffect(() => {
    localStorage.setItem('greengrow_cart', JSON.stringify(cart))
  }, [cart])

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    itemCount: cart.reduce((n, i) => n + i.quantity, 0),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
