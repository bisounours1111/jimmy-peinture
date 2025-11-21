<script setup>
import { ref, onMounted, computed } from "vue";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/stores/auth";
import {
  Search,
  Shield,
  User,
  CheckCircle,
  XCircle,
  Mail,
} from "lucide-vue-next";

const authStore = useAuthStore();
const users = ref([]);
const loading = ref(true);
const searchQuery = ref("");

const fetchUsers = async () => {
  loading.value = true;
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (!error) users.value = data;
  loading.value = false;
};

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const query = searchQuery.value.toLowerCase();
  return users.value.filter(
    (user) =>
      user.email?.toLowerCase().includes(query) ||
      user.first_name?.toLowerCase().includes(query) ||
      user.last_name?.toLowerCase().includes(query)
  );
});

const toggleAdmin = async (user) => {
  // Protection : ne pas se retirer soi-même les droits admin
  if (user.id === authStore.user.id) {
    alert("Vous ne pouvez pas modifier vos propres droits.");
    return;
  }

  const newStatus = !user.is_admin;
  const action = newStatus
    ? "promouvoir Administrateur"
    : "rétrograder Utilisateur";

  if (!confirm(`Voulez-vous vraiment ${action} ${user.email} ?`)) return;

  const { error } = await supabase
    .from("users")
    .update({ is_admin: newStatus })
    .eq("id", user.id);

  if (error) {
    alert("Erreur lors de la mise à jour : " + error.message);
  } else {
    // Mise à jour locale
    user.is_admin = newStatus;
  }
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("fr-FR");
};

onMounted(fetchUsers);
</script>

<template>
  <div>
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
    >
      <h1 class="text-2xl font-bold text-slate-800">Gestion des Clients</h1>

      <div class="relative w-full sm:w-64">
        <Search class="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher un client..."
          class="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm"
        />
      </div>
    </div>

    <div
      class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
    >
      <div v-if="loading" class="p-8 text-center text-slate-500">
        Chargement...
      </div>

      <div
        v-else-if="users.length === 0"
        class="p-8 text-center text-slate-500"
      >
        Aucun utilisateur trouvé.
      </div>

      <table v-else class="w-full text-left">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="p-4 font-medium text-slate-600">Utilisateur</th>
            <th class="p-4 font-medium text-slate-600">Contact</th>
            <th class="p-4 font-medium text-slate-600">Inscription</th>
            <th class="p-4 font-medium text-slate-600">Rôle</th>
            <th class="p-4 font-medium text-slate-600 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="user in filteredUsers"
            :key="user.id"
            class="hover:bg-slate-50"
          >
            <td class="p-4">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
                >
                  <User class="w-5 h-5" />
                </div>
                <div>
                  <div class="font-medium text-slate-900">
                    {{ user.first_name }} {{ user.last_name }}
                  </div>
                  <div class="text-xs text-slate-500 font-mono">
                    ID: {{ user.id.slice(0, 8) }}...
                  </div>
                </div>
              </div>
            </td>
            <td class="p-4 text-sm">
              <div class="flex items-center gap-2 mb-1">
                <Mail class="w-3 h-3 text-slate-400" /> {{ user.email }}
              </div>
              <div v-if="user.phone" class="text-slate-500 pl-5">
                {{ user.phone }}
              </div>
            </td>
            <td class="p-4 text-sm text-slate-500">
              {{ formatDate(user.created_at) }}
            </td>
            <td class="p-4">
              <span
                v-if="user.is_admin"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
              >
                <Shield class="w-3 h-3 mr-1" /> Admin
              </span>
              <span
                v-else
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800"
              >
                Client
              </span>
            </td>
            <td class="p-4 text-right">
              <button
                v-if="!user.is_admin"
                @click="toggleAdmin(user)"
                class="text-xs font-medium text-primary-600 hover:text-primary-800 hover:underline"
              >
                Passer Admin
              </button>
              <button
                v-else
                @click="toggleAdmin(user)"
                class="text-xs font-medium text-red-600 hover:text-red-800 hover:underline"
                :disabled="user.id === authStore.user.id"
                :class="{
                  'opacity-50 cursor-not-allowed':
                    user.id === authStore.user.id,
                }"
              >
                Retirer Admin
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

