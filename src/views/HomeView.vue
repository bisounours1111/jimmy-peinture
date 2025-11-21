<script setup>
import { onMounted, ref } from "vue";
import { useProductStore } from "@/stores/products";
import { useCartStore } from "@/stores/cart";
import ProductModal from "@/components/ProductModal.vue";
import {
  ShoppingBag,
  Clock,
  ShieldCheck,
  MousePointerClick,
  Truck,
  CreditCard,
  ArrowDown,
} from "lucide-vue-next";

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

const scrollToProducts = () => {
  document.getElementById("catalogue").scrollIntoView({ behavior: "smooth" });
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
  <div>
    <!-- HERO SECTION (Minimalist & Clean) -->
    <section
      class="relative bg-gradient-to-b from-slate-50 to-white pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden"
    >
      <!-- Decorative blobs -->
      <div
        class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full z-0 pointer-events-none"
      >
        <div
          class="absolute top-10 left-0 w-48 h-48 md:top-20 md:left-10 md:w-72 md:h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"
        ></div>
        <div
          class="absolute top-10 right-0 w-48 h-48 md:top-20 md:right-10 md:w-72 md:h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"
        ></div>
        <div
          class="absolute -bottom-20 left-1/2 w-48 h-48 md:-bottom-32 md:w-72 md:h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"
        ></div>
      </div>

      <div class="container mx-auto px-4 relative z-10 text-center">
        <div
          class="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white shadow-sm border border-slate-100 text-primary-700 text-xs md:text-sm font-semibold mb-6 md:mb-8 animate-fade-in-up"
        >
          <span class="relative flex h-2.5 w-2.5">
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"
            ></span>
            <span
              class="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500"
            ></span>
          </span>
          Nouveau : Commandez en ligne, retirez au Drive
        </div>

        <h1
          class="text-4xl md:text-7xl font-black text-slate-900 tracking-tight mb-4 md:mb-6 leading-tight"
        >
          Donnez vie à <br />
          <span
            class="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-500"
            >vos couleurs.</span
          >
        </h1>

        <p
          class="text-lg md:text-xl text-slate-600 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          La qualité professionnelle accessible à tous.
          <br class="hidden md:inline" />
          Simple, rapide et près de chez vous.
        </p>

        <div
          class="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 mb-12 md:mb-16"
        >
          <button
            @click="scrollToProducts"
            class="w-full sm:w-auto px-8 py-3 md:py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold text-base md:text-lg transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 transform hover:-translate-y-1"
          >
            <ShoppingBag class="w-5 h-5" />
            Voir le catalogue
          </button>
          <a
            href="#comment-ca-marche"
            class="w-full sm:w-auto px-8 py-3 md:py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-full font-bold text-base md:text-lg transition-all flex items-center justify-center"
          >
            Comment ça marche ?
          </a>
        </div>

        <!-- Trust Indicators (Integrated) -->
        <div
          class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto border-t border-slate-200/60 pt-8 md:pt-10"
        >
          <div class="flex flex-col items-center gap-2">
            <div class="p-2 bg-blue-50 text-blue-600 rounded-xl mb-1">
              <Clock class="w-6 h-6" />
            </div>
            <span class="font-bold text-slate-900 text-sm">Retrait 10 min</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <div class="p-2 bg-green-50 text-green-600 rounded-xl mb-1">
              <ShieldCheck class="w-6 h-6" />
            </div>
            <span class="font-bold text-slate-900 text-sm">Qualité Pro</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <div class="p-2 bg-orange-50 text-orange-600 rounded-xl mb-1">
              <Truck class="w-6 h-6" />
            </div>
            <span class="font-bold text-slate-900 text-sm">Stock local</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <div class="p-2 bg-purple-50 text-purple-600 rounded-xl mb-1">
              <CreditCard class="w-6 h-6" />
            </div>
            <span class="font-bold text-slate-900 text-sm"
              >Paiement Sécurisé</span
            >
          </div>
        </div>
      </div>
    </section>

    <!-- CATALOGUE SECTION -->
    <section id="catalogue" class="py-20 bg-slate-50">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Nos Peintures Phares
          </h2>
          <p class="text-slate-600 max-w-2xl mx-auto">
            Découvrez notre sélection exclusive de peintures haute performance.
            Des produits durables et couvrants pour un résultat impeccable.
          </p>
        </div>

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
          class="text-center text-slate-500 py-12 bg-white rounded-lg shadow-sm"
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
            class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary-900/5 transition-all duration-300 cursor-pointer border border-slate-100 overflow-hidden flex flex-col group relative transform hover:-translate-y-1"
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
                  class="bg-red-500/90 backdrop-blur text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg"
                >
                  Rupture
                </span>
                <span
                  v-else-if="product.stock < 10"
                  class="bg-orange-500/90 backdrop-blur text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg"
                >
                  Stock limité
                </span>
              </div>
            </div>

            <div class="p-8 flex-grow flex flex-col">
              <div class="mb-6 flex-grow">
                <h3
                  class="text-3xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors"
                >
                  {{ product.name }}
                </h3>
                <p
                  class="text-sm text-slate-500 mb-4 font-mono bg-slate-100 inline-block px-2 py-1 rounded"
                >
                  Réf: {{ product.reference }}
                </p>
                <p class="text-slate-600 leading-relaxed text-lg line-clamp-3">
                  {{ product.description }}
                </p>
              </div>

              <div
                class="flex items-center justify-between mt-auto pt-6 border-t border-slate-50"
              >
                <div class="flex flex-col">
                  <span class="text-sm text-slate-400 font-medium"
                    >Prix unitaire</span
                  >
                  <span class="text-4xl font-bold text-primary-600">{{
                    formatPrice(product.price)
                  }}</span>
                </div>

                <button
                  @click.stop="cartStore.addItem(product)"
                  :disabled="product.stock <= 0"
                  class="bg-slate-900 hover:bg-primary-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-lg font-bold h-14 w-14 rounded-full transition-all shadow-lg flex items-center justify-center group-hover:scale-110"
                  title="Ajouter au panier"
                >
                  <ShoppingBag class="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section
      id="comment-ca-marche"
      class="py-20 bg-white border-t border-slate-100"
    >
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-slate-900 mb-4">
            Comment ça marche ?
          </h2>
          <p class="text-slate-600">
            Le Drive Jimmy Peinture, simple comme bonjour.
          </p>
        </div>

        <div
          class="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto relative"
        >
          <!-- Ligne de connexion (Desktop) -->
          <div
            class="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-slate-100 -z-10"
          ></div>

          <!-- Etape 1 -->
          <div class="flex flex-col items-center text-center">
            <div
              class="w-24 h-24 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center mb-6 shadow-sm text-primary-600"
            >
              <MousePointerClick class="w-10 h-10" />
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-2">
              1. Commandez en ligne
            </h3>
            <p class="text-slate-500 leading-relaxed">
              Sélectionnez vos produits et ajoutez-les à votre panier. Créez un
              compte pour suivre vos commandes.
            </p>
          </div>

          <!-- Etape 2 -->
          <div class="flex flex-col items-center text-center">
            <div
              class="w-24 h-24 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center mb-6 shadow-sm text-primary-600"
            >
              <Clock class="w-10 h-10" />
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-2">
              2. Choisissez un créneau
            </h3>
            <p class="text-slate-500 leading-relaxed">
              Réservez l'heure de passage qui vous arrange. Nos créneaux sont
              flexibles et mis à jour en temps réel.
            </p>
          </div>

          <!-- Etape 3 -->
          <div class="flex flex-col items-center text-center">
            <div
              class="w-24 h-24 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center mb-6 shadow-sm text-primary-600"
            >
              <Truck class="w-10 h-10" />
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-2">
              3. Récupérez au Drive
            </h3>
            <p class="text-slate-500 leading-relaxed">
              Présentez votre code de commande à notre comptoir Drive. Votre
              commande sera prête !
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Product Modal -->
    <ProductModal
      v-if="selectedProduct"
      :product="selectedProduct"
      :isOpen="!!selectedProduct"
      @close="closeProduct"
    />
  </div>
</template>
