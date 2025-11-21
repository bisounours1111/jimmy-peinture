import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useCartStore = defineStore("cart", () => {
  const items = ref([]);

  // Getters
  const totalItems = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  );

  const totalPrice = computed(() => {
    return items.value.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  });

  // Actions
  function addItem(product) {
    const existingItem = items.value.find((item) => item.id === product.id);

    if (existingItem) {
      // Vérifier le stock disponible ici idéalement
      existingItem.quantity++;
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        reference: product.reference,
        price: product.price,
        image_url: product.image_url,
        quantity: 1,
        maxStock: product.stock, // Pour empêcher de commander plus que le stock
      });
    }
  }

  function removeItem(productId) {
    const index = items.value.findIndex((item) => item.id === productId);
    if (index > -1) {
      items.value.splice(index, 1);
    }
  }

  function updateQuantity(productId, quantity) {
    const item = items.value.find((item) => item.id === productId);
    if (item) {
      if (quantity <= 0) {
        removeItem(productId);
      } else if (quantity <= item.maxStock) {
        item.quantity = quantity;
      }
    }
  }

  function clearCart() {
    items.value = [];
  }

  return {
    items,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
});
