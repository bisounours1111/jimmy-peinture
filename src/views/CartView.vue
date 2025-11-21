<script setup>
import { useCartStore } from "@/stores/cart";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-vue-next";
import { RouterLink } from "vue-router";

const cartStore = useCartStore();

const formatPrice = (price) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};
</script>

<template>
  <div class="container mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold text-slate-900 mb-8">Votre Panier</h1>

    <div
      v-if="cartStore.items.length === 0"
      class="text-center py-16 bg-white rounded-lg shadow-sm border border-slate-100"
    >
      <p class="text-xl text-slate-600 mb-6">Votre panier est vide.</p>
      <RouterLink
        to="/"
        class="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
      >
        <ArrowRight class="w-5 h-5 mr-2 rotate-180" />
        Retourner à la boutique
      </RouterLink>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Liste des produits -->
      <div class="lg:col-span-2 space-y-4">
        <div
          v-for="item in cartStore.items"
          :key="item.id"
          class="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-4"
        >
          <!-- Image -->
          <div
            class="w-20 h-20 bg-slate-200 rounded flex-shrink-0 overflow-hidden"
          >
            <img
              v-if="item.image_url"
              :src="item.image_url"
              :alt="item.name"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Infos -->
          <div class="flex-grow text-center sm:text-left">
            <h3 class="font-semibold text-slate-900">{{ item.name }}</h3>
            <p class="text-sm text-slate-500">Réf: {{ item.reference }}</p>
            <p class="text-primary-600 font-medium sm:hidden mt-1">
              {{ formatPrice(item.price) }}
            </p>
          </div>

          <!-- Contrôles Quantité -->
          <div class="flex items-center border border-slate-200 rounded">
            <button
              @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
              class="p-2 text-slate-600 hover:text-primary-600 transition-colors"
            >
              <Minus class="w-4 h-4" />
            </button>
            <input
              type="number"
              v-model.number="item.quantity"
              @change="cartStore.updateQuantity(item.id, item.quantity)"
              class="w-12 text-center border-x border-slate-200 py-1 text-sm focus:outline-none"
              min="1"
            />
            <button
              @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
              class="p-2 text-slate-600 hover:text-primary-600 transition-colors"
            >
              <Plus class="w-4 h-4" />
            </button>
          </div>

          <!-- Prix Total Ligne -->
          <div class="text-right w-24 hidden sm:block">
            <p class="font-bold text-slate-900">
              {{ formatPrice(item.price * item.quantity) }}
            </p>
            <p class="text-xs text-slate-500">
              {{ formatPrice(item.price) }} / unité
            </p>
          </div>

          <!-- Supprimer -->
          <button
            @click="cartStore.removeItem(item.id)"
            class="p-2 text-red-400 hover:text-red-600 transition-colors"
            title="Supprimer"
          >
            <Trash2 class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Résumé -->
      <div class="lg:col-span-1">
        <div
          class="bg-white p-6 rounded-lg shadow-sm border border-slate-100 sticky top-24"
        >
          <h2 class="text-xl font-bold text-slate-900 mb-4">Récapitulatif</h2>

          <div class="space-y-3 mb-6">
            <div class="flex justify-between text-slate-600">
              <span>Sous-total</span>
              <span>{{ formatPrice(cartStore.totalPrice) }}</span>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>Frais de préparation</span>
              <span class="text-green-600 font-medium">Offerts</span>
            </div>
            <div
              class="border-t border-slate-100 pt-3 flex justify-between text-lg font-bold text-slate-900"
            >
              <span>Total</span>
              <span>{{ formatPrice(cartStore.totalPrice) }}</span>
            </div>
          </div>

          <RouterLink
            to="/checkout"
            class="block w-full bg-primary-600 hover:bg-primary-700 text-white text-center font-bold py-3 px-4 rounded transition-colors shadow-lg shadow-primary-600/20"
          >
            Valider la commande
          </RouterLink>

          <p class="text-xs text-slate-500 text-center mt-4">
            Les créneaux de retrait seront disponibles à l'étape suivante.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
