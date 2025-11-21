<script setup>
import { X } from "lucide-vue-next";
import { useCartStore } from "@/stores/cart";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);
const cartStore = useCartStore();

const formatPrice = (price) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
  >
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      @click="$emit('close')"
    ></div>

    <!-- Modal Content -->
    <div
      class="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[80vh] animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm backdrop-blur text-slate-500 hover:text-slate-900 transition-colors"
      >
        <X class="w-6 h-6" />
      </button>

      <!-- Image Section (Half width on desktop) -->
      <div class="w-full md:w-1/2 h-64 md:h-auto bg-slate-100 relative">
        <img
          v-if="product.image_url"
          :src="product.image_url"
          :alt="product.name"
          class="w-full h-full object-cover"
        />
        <div
          v-else
          class="w-full h-full flex items-center justify-center text-slate-400"
        >
          Image non disponible
        </div>
      </div>

      <!-- Info Section -->
      <div class="w-full md:w-1/2 p-8 flex flex-col overflow-y-auto">
        <div class="mb-6">
          <p class="text-sm font-mono text-slate-500 mb-2">
            Réf: {{ product.reference }}
          </p>
          <h2 class="text-3xl font-bold text-slate-900 mb-4">
            {{ product.name }}
          </h2>

          <!-- Stock Status -->
          <div class="mb-6">
            <span
              v-if="product.stock <= 0"
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
            >
              Rupture de stock
            </span>
            <span
              v-else-if="product.stock < 10"
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800"
            >
              Stock limité ({{ product.stock }} restants)
            </span>
            <span
              v-else
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
            >
              En stock
            </span>
          </div>

          <div class="prose prose-slate text-slate-600">
            <h3 class="text-lg font-semibold text-slate-900 mb-2">
              Description
            </h3>
            <p class="whitespace-pre-line leading-relaxed">
              {{ product.description }}
            </p>

            <template v-if="product.specifications">
              <h3 class="text-lg font-semibold text-slate-900 mt-6 mb-2">
                Caractéristiques
              </h3>
              <p class="whitespace-pre-line">{{ product.specifications }}</p>
            </template>
          </div>
        </div>

        <div
          class="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between gap-4"
        >
          <div class="text-3xl font-bold text-primary-600">
            {{ formatPrice(product.price) }}
          </div>

          <button
            @click="
              cartStore.addItem(product);
              $emit('close');
            "
            :disabled="product.stock <= 0"
            class="flex-grow bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-primary-600/20"
          >
            {{ product.stock > 0 ? "Ajouter au panier" : "Indisponible" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
