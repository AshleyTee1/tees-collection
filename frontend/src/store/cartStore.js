import { create } from 'zustand'

let _cartCounter = 0

export const useCartStore = create((set, get) => ({
  items: [],

  addItem: (product, options = {}) => {
    const item = { ...product, ...options, cartId: ++_cartCounter }
    set(s => ({ items: [...s.items, item] }))
  },

  removeItem: (cartId) =>
    set(s => ({ items: s.items.filter(i => i.cartId !== cartId) })),

  updateQty: (cartId, qty) =>
    set(s => ({
      items: qty < 1
        ? s.items.filter(i => i.cartId !== cartId)
        : s.items.map(i => i.cartId === cartId ? { ...i, qty } : i)
    })),

  clearCart: () => set({ items: [] }),

  subtotal: () => {
    const items = get().items
    const totalGlassesQty = items.filter(i => i.category === 'glasses' && i.availability === 'by_order').reduce((sum, i) => sum + (i.qty || 1), 0)
    const totalPassportCoverQty = items.filter(i => i.name?.toLowerCase().includes('passport cover') && i.availability === 'by_order').reduce((sum, i) => sum + (i.qty || 1), 0)
    return items.reduce((sum, i) => {
      const qty = i.qty || 1
      let price
      if (i.availability === 'by_order') {
        if (i.shipping === 'sea') {
          price = i.price_sea ?? 0
        } else if (i.category === 'glasses') {
          price = totalGlassesQty >= 10 ? (i.price_air ?? i.price_usd) : (i.price_usd ?? 0)
        } else if (i.name?.toLowerCase().includes('passport cover')) {
          price = totalPassportCoverQty >= 10 ? (i.price_air ?? i.price_usd) : (i.price_usd ?? 0)
        } else {
          price = qty >= 10 ? (i.price_air ?? i.price_usd) : (i.price_usd ?? 0)
        }
      } else {
        price = i.price_usd ?? 0
      }
      return sum + price * qty
    }, 0)
  },
}))
