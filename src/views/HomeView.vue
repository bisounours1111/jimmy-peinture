<script setup>
import { onMounted, ref } from "vue";
import { useProductStore } from "@/stores/products";
import { useCartStore } from "@/stores/cart";
import ProductModal from "@/components/ProductModal.vue";

const productStore = useProductStore();
const cartStore = useCartStore();
const selectedProduct = ref(null);

onMounted(() => {
  productStore.fetchProducts();
});

const openProduct = (product) => {
  selectedProduct.value = product;
};

const closeProduct = () => {
  selectedProduct.value = null;
};

// Fonction pour formater le prix
const formatPrice = (price) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};
</script>

<template>
  <div class="container mx-auto px-4 py-12">
    <header class="mb-12 text-center">
      <h1 class="text-4xl font-bold text-slate-900 mb-4">
        Bienvenue chez Jimmy Peinture
      </h1>
      <p class="text-lg text-slate-600 max-w-2xl mx-auto">
        La référence pour vos travaux de peinture. Commandez en ligne,
        choisissez votre créneau et récupérez votre commande au drive en toute
        simplicité.
      </p>
    </header>

    <!-- Loading State -->
    <div v-if="productStore.loading" class="flex justify-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"
      ></div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="productStore.error"
      class="text-center text-red-600 py-12 bg-red-50 rounded-lg"
    >
      {{ productStore.error }}
    </div>

    <!-- Empty State -->
    <div
      v-else-if="productStore.products.length === 0"
      class="text-center text-slate-500 py-12 bg-slate-50 rounded-lg"
    >
      Aucun produit disponible pour le moment.
    </div>

    <!-- Products Grid -->
    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto"
    >
      <div
        v-for="product in productStore.products"
        :key="product.id"
        @click="openProduct(product)"
        class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer border border-slate-100 overflow-hidden flex flex-col group"
      >
        <!-- Image Carrée -->
        <div class="aspect-square bg-slate-100 relative overflow-hidden">
          <img
            v-if="product.image_url"
            :src="product.image_url"
            :alt="product.name"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center text-slate-400"
          >
            <span class="text-lg font-medium">Image non disponible</span>
          </div>

          <!-- Badge Stock -->
          <div class="absolute top-4 right-4">
            <span
              v-if="product.stock <= 0"
              class="bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-sm"
            >
              Rupture
            </span>
            <span
              v-else-if="product.stock < 10"
              class="bg-orange-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-sm"
            >
              Stock limité
            </span>
          </div>
        </div>

        <div class="p-8 flex-grow flex flex-col">
          <div class="mb-6 flex-grow">
            <h3
              class="text-2xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors"
            >
              {{ product.name }}
            </h3>
            <p class="text-sm text-slate-500 mb-4 font-mono">
              Réf: {{ product.reference }}
            </p>
            <p class="text-slate-600 leading-relaxed text-lg line-clamp-3">
              {{ product.description }}
            </p>
          </div>

          <div
            class="flex items-center justify-between mt-auto pt-6 border-t border-slate-50"
          >
            <span class="text-3xl font-bold text-primary-600">{{
              formatPrice(product.price)
            }}</span>

            <button
              @click.stop="cartStore.addItem(product)"
              :disabled="product.stock <= 0"
              class="bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-lg font-bold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-primary-600/20 flex items-center gap-2 transform active:scale-95"
            >
              <span v-if="product.stock > 0">Ajouter au panier</span>
              <span v-else>Indisponible</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Modal -->
    <ProductModal
      v-if="selectedProduct"
      :product="selectedProduct"
      :isOpen="!!selectedProduct"
      @close="closeProduct"
    />
  </div>
</template>
