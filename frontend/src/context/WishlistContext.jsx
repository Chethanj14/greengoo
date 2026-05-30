import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { getWishlist, addToWishlist as apiAdd, removeFromWishlist as apiRemove } from '../api/client'

const WishlistContext = createContext(null)

function getSessionId() {
  let id = localStorage.getItem('greengrow_session_id')
  if (!id) {
    id = 'sess_' + Math.random().toString(36).slice(2) + Date.now()
    localStorage.setItem('greengrow_session_id', id)
  }
  return id
}

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(false)
  const sessionId = getSessionId()

  const fetchWishlist = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getWishlist(sessionId)
      setWishlist(Array.isArray(data) ? data : [])
    } catch {
      setWishlist([])
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  const addToWishlist = useCallback(
    async (productId) => {
      try {
        await apiAdd(productId, sessionId)
        await fetchWishlist()
      } catch (e) {
        console.error(e)
      }
    },
    [sessionId, fetchWishlist]
  )

  const removeFromWishlist = useCallback(
    async (productId) => {
      try {
        await apiRemove(productId, sessionId)
        setWishlist((prev) => prev.filter((p) => p.id !== productId))
      } catch (e) {
        console.error(e)
      }
    },
    [sessionId]
  )

  const isInWishlist = useCallback(
    (productId) => wishlist.some((p) => p.id === productId),
    [wishlist]
  )

  const value = {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refresh: fetchWishlist,
  }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
