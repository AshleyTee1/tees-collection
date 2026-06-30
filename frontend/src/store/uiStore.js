import { create } from 'zustand'

export const useUiStore = create((set) => ({
  // Toast
  toast: null,
  showToast: (msg) => {
    set({ toast: msg })
    setTimeout(() => set({ toast: null }), 3200)
  },

  // Cart panel
  cartOpen: false,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),

  // Product modal
  modalProduct: null,
  openModal: (product) => set({ modalProduct: product }),
  closeModal: () => set({ modalProduct: null }),
}))
