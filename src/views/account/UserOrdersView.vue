<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/stores/auth";
import {
  ShoppingBag,
  Clock,
  Calendar,
  ChevronRight,
  ArrowRight,
} from "lucide-vue-next";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();
const orders = ref([]);
const loading = ref(true);

const fetchMyOrders = async () => {
  loading.value = true;

  // S'assurer que l'user est chargé
  if (!authStore.user) await authStore.initialize();
  if (!authStore.user) {
    router.push("/login");
    return;
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        product_name,
        quantity,
        total_price
      )
    `
    )
    .eq("user_id", authStore.user.id)
    .order("created_at", { ascending: false });

  if (!error) orders.value = data;
  loading.value = false;
};

const statusColor = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "validated":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "cancelled":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const statusLabel = (status) => {
  const labels = {
    pending: "En attente",
    validated: "Validée (Prête à retirer)",
    completed: "Terminée",
    cancelled: "Annulée",
  };
  return labels[status] || status;
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

onMounted(fetchMyOrders);
</script>

<template>
  <div class="container mx-auto px-4 py-12 max-w-4xl">
    <header class="mb-8 flex justify-between items-center">
      <h1 class="text-3xl font-bold text-slate-900">Mes Commandes</h1>
      <button
        @click="router.push('/products')"
        class="text-primary-600 font-medium hover:underline"
      >
        Nouvelle commande
      </button>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"
      ></div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="orders.length === 0"
      class="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm"
    >
      <div
        class="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"
      >
        <ShoppingBag class="w-8 h-8" />
      </div>
      <h2 class="text-xl font-semibold text-slate-900 mb-2">
        Aucune commande pour le moment
      </h2>
      <p class="text-slate-500 mb-6">
        Vous n'avez pas encore passé de commande chez nous.
      </p>
      <button
        @click="router.push('/products')"
        class="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-lg transition-colors inline-flex items-center"
      >
        Découvrir nos produits <ArrowRight class="ml-2 w-4 h-4" />
      </button>
    </div>

    <!-- Orders List -->
    <div v-else class="space-y-6">
      <div
        v-for="order in orders"
        :key="order.id"
        class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
      >
        <!-- Header Carte -->
        <div
          class="p-6 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-start bg-slate-50/50"
        >
          <div>
            <div class="flex items-center gap-3 mb-1">
              <span class="font-mono font-bold text-lg text-slate-900"
                >#{{ order.order_code }}</span
              >
              <span
                :class="[
                  'px-2 py-0.5 text-xs font-bold rounded border',
                  statusColor(order.status),
                ]"
              >
                {{ statusLabel(order.status) }}
              </span>
            </div>
            <p class="text-sm text-slate-500">
              Commandé le {{ formatDate(order.created_at) }}
            </p>
          </div>
          <div class="text-right">
            <div class="text-xl font-bold text-slate-900">
              {{ formatPrice(order.total_amount) }}
            </div>
            <div class="text-sm text-slate-500">
              {{ order.order_items.length }} article(s)
            </div>
          </div>
        </div>

        <!-- Body Carte -->
        <div class="p-6">
          <!-- Info Retrait -->
          <div
            class="flex items-start gap-3 mb-6 p-4 bg-blue-50 rounded-lg text-blue-800 text-sm border border-blue-100"
          >
            <Calendar class="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p class="font-bold">Créneau de retrait</p>
              <p>
                Le {{ formatDate(order.slot_date) }} entre
                {{ order.slot_start_time }} et {{ order.slot_end_time }}
              </p>
              <p
                v-if="order.status === 'validated'"
                class="mt-2 font-medium text-blue-900"
              >
                N'oubliez pas votre code :
                <span
                  class="font-mono bg-white px-1 py-0.5 rounded border border-blue-200"
                  >{{ order.order_code }}</span
                >
              </p>
            </div>
          </div>

          <!-- Liste Articles (Aperçu) -->
          <div class="space-y-2">
            <div
              v-for="item in order.order_items"
              :key="item.id"
              class="flex justify-between text-sm text-slate-700"
            >
              <span>{{ item.quantity }}x {{ item.product_name }}</span>
              <span class="text-slate-500">{{
                formatPrice(item.total_price)
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

