<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "@/lib/supabaseClient";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Clock,
  Search,
} from "lucide-vue-next";

const orders = ref([]);
const loading = ref(true);
const expandedOrderId = ref(null);
const filterStatus = ref("all");

const fetchOrders = async () => {
  loading.value = true;
  let query = supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        id,
        product_name,
        product_reference,
        quantity,
        unit_price,
        total_price
      )
    `
    )
    .order("created_at", { ascending: false });

  if (filterStatus.value !== "all") {
    query = query.eq("status", filterStatus.value);
  }

  const { data, error } = await query;
  if (!error) orders.value = data;
  loading.value = false;
};

const toggleDetails = (orderId) => {
  expandedOrderId.value = expandedOrderId.value === orderId ? null : orderId;
};

const updateStatus = async (order, newStatus) => {
  if (!confirm(`Passer la commande ${order.order_code} à "${newStatus}" ?`))
    return;

  try {
    // Si validation, on décrémente le stock
    if (newStatus === "validated" && order.status !== "validated") {
      for (const item of order.order_items) {
        // Note: Idéalement faire ça via une fonction RPC pour l'atomicité
        // 1. Récupérer produit actuel
        const { data: product } = await supabase
          .from("products")
          .select("stock")
          .eq("reference", item.product_reference) // On utilise la ref car l'ID peut changer si suppr/recreate
          .single();

        if (product) {
          await supabase
            .from("products")
            .update({ stock: product.stock - item.quantity })
            .eq("reference", item.product_reference);
        }
      }
    }

    // Si annulation après validation, on recrédite le stock (Bonus)
    if (newStatus === "cancelled" && order.status === "validated") {
      for (const item of order.order_items) {
        const { data: product } = await supabase
          .from("products")
          .select("stock")
          .eq("reference", item.product_reference)
          .single();
        if (product) {
          await supabase
            .from("products")
            .update({ stock: product.stock + item.quantity })
            .eq("reference", item.product_reference);
        }
      }
    }

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", order.id);

    if (error) throw error;

    fetchOrders();
  } catch (e) {
    alert("Erreur : " + e.message);
  }
};

const statusColor = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "validated":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

const statusLabel = (status) => {
  const labels = {
    pending: "En attente",
    validated: "Validée (Prête)",
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

onMounted(fetchOrders);
</script>

<template>
  <div>
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
    >
      <h1 class="text-2xl font-bold text-slate-800">Gestion des Commandes</h1>

      <div class="flex gap-2">
        <select
          v-model="filterStatus"
          @change="fetchOrders"
          class="border border-slate-300 rounded p-2 text-sm"
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="validated">Validées</option>
          <option value="completed">Terminées</option>
          <option value="cancelled">Annulées</option>
        </select>
        <button
          @click="fetchOrders"
          class="p-2 bg-white border border-slate-300 rounded hover:bg-slate-50"
        >
          Actualiser
        </button>
      </div>
    </div>

    <div
      class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
    >
      <div v-if="loading" class="p-8 text-center text-slate-500">
        Chargement des commandes...
      </div>

      <div
        v-else-if="orders.length === 0"
        class="p-8 text-center text-slate-500"
      >
        Aucune commande trouvée.
      </div>

      <div v-else>
        <div
          v-for="order in orders"
          :key="order.id"
          class="border-b border-slate-100 last:border-0"
        >
          <!-- Ligne Résumé -->
          <div
            @click="toggleDetails(order.id)"
            class="p-4 flex flex-wrap items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div class="flex items-center gap-4 mb-2 sm:mb-0">
              <div
                :class="[
                  'px-2 py-1 text-xs font-bold rounded uppercase',
                  statusColor(order.status),
                ]"
              >
                {{ statusLabel(order.status) }}
              </div>
              <div>
                <span class="font-mono font-bold text-slate-900 text-lg"
                  >#{{ order.order_code }}</span
                >
                <span class="text-slate-500 text-sm ml-2">{{
                  new Date(order.created_at).toLocaleDateString()
                }}</span>
              </div>
            </div>

            <div class="flex items-center gap-6 text-sm text-slate-600">
              <div class="flex items-center gap-1">
                <Clock class="w-4 h-4" />
                <span class="font-medium text-slate-900"
                  >{{ order.slot_date }} à {{ order.slot_start_time }}</span
                >
              </div>
              <div class="font-bold text-slate-900 text-lg w-24 text-right">
                {{ formatPrice(order.total_amount) }}
              </div>
              <component
                :is="expandedOrderId === order.id ? ChevronUp : ChevronDown"
                class="w-5 h-5 text-slate-400"
              />
            </div>
          </div>

          <!-- Détail Accordéon -->
          <div
            v-if="expandedOrderId === order.id"
            class="bg-slate-50 p-4 sm:p-6 border-t border-slate-100"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Infos Client -->
              <div>
                <h3 class="font-bold text-slate-900 mb-3">Client</h3>
                <div
                  class="bg-white p-4 rounded border border-slate-200 text-sm space-y-1"
                >
                  <p>
                    <span class="font-medium">Nom :</span>
                    {{ order.first_name }} {{ order.last_name }}
                  </p>
                  <p>
                    <span class="font-medium">Email :</span> {{ order.email }}
                  </p>
                  <p>
                    <span class="font-medium">Tél :</span> {{ order.phone }}
                  </p>
                  <p class="mt-2 pt-2 border-t border-slate-100">
                    <span class="font-medium">Paiement :</span>
                    <span v-if="order.payment_method === 'cash'"
                      >Sur place (Liquide/Chèque)</span
                    >
                    <span v-else>Carte Bancaire (Stripe)</span>
                    -
                    <span
                      :class="
                        order.payment_status === 'paid'
                          ? 'text-green-600'
                          : 'text-orange-600'
                      "
                    >
                      {{
                        order.payment_status === "paid" ? "Payé" : "En attente"
                      }}
                    </span>
                  </p>
                </div>
              </div>

              <!-- Liste Produits -->
              <div>
                <h3 class="font-bold text-slate-900 mb-3">
                  Produits ({{ order.order_items.length }})
                </h3>
                <div
                  class="bg-white rounded border border-slate-200 overflow-hidden"
                >
                  <table class="w-full text-sm">
                    <thead class="bg-slate-50 text-slate-500">
                      <tr>
                        <th class="p-2 text-left">Produit</th>
                        <th class="p-2 text-right">Qté</th>
                        <th class="p-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      <tr v-for="item in order.order_items" :key="item.id">
                        <td class="p-2">
                          <div class="font-medium">{{ item.product_name }}</div>
                          <div class="text-xs text-slate-500">
                            {{ item.product_reference }}
                          </div>
                        </td>
                        <td class="p-2 text-right font-bold">
                          {{ item.quantity }}
                        </td>
                        <td class="p-2 text-right">
                          {{ formatPrice(item.total_price) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Barre Actions -->
            <div
              class="mt-6 flex flex-wrap justify-end gap-3 pt-4 border-t border-slate-200"
            >
              <button
                v-if="order.status === 'pending'"
                @click="updateStatus(order, 'validated')"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium flex items-center gap-2"
              >
                <CheckCircle class="w-4 h-4" /> Valider la commande
              </button>

              <button
                v-if="order.status === 'validated'"
                @click="updateStatus(order, 'completed')"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium flex items-center gap-2"
              >
                <CheckCircle class="w-4 h-4" /> Marquer comme terminée
              </button>

              <button
                v-if="
                  order.status !== 'cancelled' && order.status !== 'completed'
                "
                @click="updateStatus(order, 'cancelled')"
                class="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded font-medium flex items-center gap-2"
              >
                <XCircle class="w-4 h-4" /> Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
