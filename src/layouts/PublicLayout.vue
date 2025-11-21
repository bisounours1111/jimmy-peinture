<script setup>
import {
  ShoppingCart,
  Menu,
  User,
  LogOut,
  Settings,
  ShoppingBag,
} from "lucide-vue-next";
import { ref, onMounted, computed } from "vue";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const cartStore = useCartStore();
const authStore = useAuthStore();
const router = useRouter();
const isMobileMenuOpen = ref(false);
const isUserMenuOpen = ref(false);

// Calcul du nom à afficher
const displayName = computed(() => {
  if (!authStore.user) return "Mon Compte";

  // 1. Priorité au profil (base de données)
  if (authStore.profile?.first_name) return authStore.profile.first_name;

  // 2. Fallback sur les métadonnées Google/Auth
  const meta = authStore.user.user_metadata;
  if (meta?.full_name) return meta.full_name.split(" ")[0]; // Prend le premier mot
  if (meta?.name) return meta.name.split(" ")[0];
  if (meta?.given_name) return meta.given_name;

  // 3. Fallback email
  return authStore.user.email?.split("@")[0];
});

onMounted(() => {
  // Initialiser l'auth pour vérifier si l'utilisateur est déjà connecté
  authStore.initialize();
});

const handleLogout = async () => {
  await authStore.signOut();
  router.push("/");
  isUserMenuOpen.value = false;
};
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header Fixe -->
    <header
      class="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-100"
    >
      <div
        class="container mx-auto px-4 h-16 flex items-center justify-between"
      >
        <!-- Logo -->
        <RouterLink to="/" class="text-2xl font-bold text-primary-600">
          Jimmy<span class="text-slate-800">Peinture</span>
        </RouterLink>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center space-x-8">
          <!-- Liens supprimés car redondants avec le logo -->
        </nav>

        <!-- Actions -->
        <div class="flex items-center space-x-4">
          <!-- Auth Menu (Desktop) -->
          <div class="hidden md:relative md:block">
            <template v-if="authStore.user">
              <button
                @click="isUserMenuOpen = !isUserMenuOpen"
                class="flex items-center space-x-2 text-slate-600 hover:text-primary-600 font-medium focus:outline-none"
              >
                <span class="text-sm">{{ displayName }}</span>
                <User class="w-6 h-6 p-1 bg-slate-100 rounded-full" />
              </button>

              <!-- Dropdown -->
              <div
                v-if="isUserMenuOpen"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-slate-100 z-50"
              >
                <div
                  class="px-4 py-2 border-b border-slate-50 text-xs text-slate-500 truncate"
                >
                  {{ authStore.user.email }}
                </div>

                <RouterLink
                  to="/account/orders"
                  class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                  @click="isUserMenuOpen = false"
                >
                  <ShoppingBag class="w-4 h-4 mr-2" /> Mes Commandes
                </RouterLink>

                <RouterLink
                  v-if="authStore.isAdmin()"
                  to="/admin/dashboard"
                  class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                  @click="isUserMenuOpen = false"
                >
                  <Settings class="w-4 h-4 mr-2" /> Administration
                </RouterLink>

                <button
                  @click="handleLogout"
                  class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <LogOut class="w-4 h-4 mr-2" /> Déconnexion
                </button>
              </div>
            </template>

            <template v-else>
              <RouterLink
                to="/login"
                class="text-sm font-bold text-primary-600 hover:text-primary-700"
              >
                Se connecter
              </RouterLink>
            </template>
          </div>

          <RouterLink
            to="/cart"
            class="relative p-2 text-slate-600 hover:text-primary-600 transition-colors"
          >
            <ShoppingCart class="w-6 h-6" />
            <!-- Badge Compteur -->
            <span
              v-if="cartStore.totalItems > 0"
              class="absolute -top-1 -right-1 bg-accent-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full"
            >
              {{ cartStore.totalItems }}
            </span>
          </RouterLink>

          <!-- Mobile Menu Button -->
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="md:hidden p-2 text-slate-600"
          >
            <Menu class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Mobile Nav -->
      <div
        v-if="isMobileMenuOpen"
        class="md:hidden bg-white border-t border-slate-100 p-4 space-y-4"
      >
        <div class="pt-4 border-t border-slate-100">
          <template v-if="authStore.user">
            <div class="text-sm text-slate-500 mb-2 px-2">
              {{ authStore.user.email }}
            </div>
            <RouterLink
              to="/account/orders"
              class="block text-slate-700 font-medium py-2"
            >
              Mes Commandes
            </RouterLink>
            <RouterLink
              v-if="authStore.isAdmin()"
              to="/admin/dashboard"
              class="block text-primary-600 font-medium py-2"
            >
              Accès Administration
            </RouterLink>
            <button
              @click="handleLogout"
              class="block text-red-600 font-medium py-2 w-full text-left"
            >
              Se déconnecter
            </button>
          </template>
          <template v-else>
            <RouterLink
              to="/login"
              class="block w-full bg-primary-600 text-white text-center py-2 rounded font-bold"
            >
              Se connecter / S'inscrire
            </RouterLink>
          </template>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow">
      <RouterView />
    </main>

    <!-- Footer -->
    <footer class="bg-slate-900 text-slate-300 py-8">
      <div class="container mx-auto px-4 text-center">
        <p>
          &copy; {{ new Date().getFullYear() }} Jimmy Peinture. Tous droits
          réservés.
        </p>
      </div>
    </footer>
  </div>
</template>
