<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "@/lib/supabaseClient";
import { ShoppingCart, Package, Users, TrendingUp } from "lucide-vue-next";

const stats = ref({
  ordersCount: 0,
  productsCount: 0,
  revenue: 0,
  customersCount: 0,
});

const loading = ref(true);

onMounted(async () => {
  try {
    // Chargement parallèle des stats
    const [ordersRes, productsRes, customersRes] = await Promise.all([
      supabase.from("orders").select("total_amount", { count: "exact" }),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("users").select("id", { count: "exact", head: true }),
    ]);

    stats.value.ordersCount = ordersRes.count || 0;
    stats.value.productsCount = productsRes.count || 0;
    stats.value.customersCount = customersRes.count || 0;

    // Calcul CA (somme simple)
    if (ordersRes.data) {
      stats.value.revenue = ordersRes.data.reduce(
        (sum, order) => sum + order.total_amount,
        0
      );
    }
  } catch (e) {
    console.error("Erreur dashboard", e);
  } finally {
    loading.value = false;
  }
});

const formatPrice = (price) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-800 mb-6">Tableau de bord</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Card Commandes -->
      <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div class="flex items-center justify-between mb-4">
          <div class="bg-blue-100 p-3 rounded-full text-blue-600">
            <ShoppingCart class="w-6 h-6" />
          </div>
          <span class="text-sm text-slate-500 font-medium"
            >Total Commandes</span
          >
        </div>
        <div class="text-2xl font-bold text-slate-900">
          {{ stats.ordersCount }}
        </div>
      </div>

      <!-- Card CA -->
      <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div class="flex items-center justify-between mb-4">
          <div class="bg-green-100 p-3 rounded-full text-green-600">
            <TrendingUp class="w-6 h-6" />
          </div>
          <span class="text-sm text-slate-500 font-medium"
            >Chiffre d'affaires</span
          >
        </div>
        <div class="text-2xl font-bold text-slate-900">
          {{ formatPrice(stats.revenue) }}
        </div>
      </div>

      <!-- Card Produits -->
      <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div class="flex items-center justify-between mb-4">
          <div class="bg-purple-100 p-3 rounded-full text-purple-600">
            <Package class="w-6 h-6" />
          </div>
          <span class="text-sm text-slate-500 font-medium"
            >Produits Actifs</span
          >
        </div>
        <div class="text-2xl font-bold text-slate-900">
          {{ stats.productsCount }}
        </div>
      </div>

      <!-- Card Clients -->
      <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div class="flex items-center justify-between mb-4">
          <div class="bg-orange-100 p-3 rounded-full text-orange-600">
            <Users class="w-6 h-6" />
          </div>
          <span class="text-sm text-slate-500 font-medium"
            >Clients Inscrits</span
          >
        </div>
        <div class="text-2xl font-bold text-slate-900">
          {{ stats.customersCount }}
        </div>
      </div>
    </div>

    <!-- Placeholder Charts or Recent Activity -->
    <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <h2 class="text-lg font-bold text-slate-800 mb-4">Activité récente</h2>
      <p class="text-slate-500 italic">
        Les dernières commandes apparaîtront ici.
      </p>
    </div>
  </div>
</template>
