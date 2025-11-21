<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Calendar,
  Settings,
  LogOut,
  Users,
  ArrowLeft,
} from "lucide-vue-next";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const handleLogout = async () => {
  await authStore.signOut();
  router.push("/admin/login");
};

const menuItems = [
  { name: "Tableau de bord", path: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Commandes", path: "/admin/orders", icon: ShoppingCart },
  { name: "Produits", path: "/admin/products", icon: Package },
  { name: "Créneaux", path: "/admin/slots", icon: Calendar },
  { name: "Clients", path: "/admin/customers", icon: Users },
  { name: "Paramètres", path: "/admin/settings", icon: Settings },
];
</script>

<template>
  <div class="min-h-screen bg-slate-100 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full">
      <div class="p-6 border-b border-slate-800">
        <h1 class="text-xl font-bold text-white">
          Jimmy<span class="text-primary-500">Admin</span>
        </h1>
      </div>

      <nav class="flex-grow p-4 space-y-2">
        <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center px-4 py-3 rounded-lg transition-colors"
          :class="
            route.path.startsWith(item.path)
              ? 'bg-primary-600 text-white'
              : 'hover:bg-slate-800 hover:text-white'
          "
        >
          <component :is="item.icon" class="w-5 h-5 mr-3" />
          {{ item.name }}
        </RouterLink>
      </nav>

      <div class="p-4 border-t border-slate-800 space-y-2">
        <RouterLink
          to="/"
          class="flex items-center w-full px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft class="w-5 h-5 mr-3" />
          Retour au site
        </RouterLink>

        <button
          @click="handleLogout"
          class="flex items-center w-full px-4 py-3 text-red-400 hover:text-red-200 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut class="w-5 h-5 mr-3" />
          Déconnexion
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-grow ml-64 p-8">
      <RouterView />
    </main>
  </div>
</template>
