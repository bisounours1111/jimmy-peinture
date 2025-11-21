import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import PublicLayout from "@/layouts/PublicLayout.vue";
import AdminLayout from "@/layouts/AdminLayout.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // PUBLIC ROUTES
    {
      path: "/",
      component: PublicLayout,
      children: [
        {
          path: "",
          name: "home",
          component: () => import("@/views/HomeView.vue"),
        },
        {
          path: "products",
          name: "products",
          component: () => import("@/views/HomeView.vue"), // Reutilise Home pour l'instant
        },
        {
          path: "cart",
          name: "cart",
          component: () => import("@/views/CartView.vue"),
        },
        {
          path: "checkout",
          name: "checkout",
          component: () => import("@/views/CheckoutView.vue"),
        },
        {
          path: "login",
          name: "login",
          component: () => import("@/views/AuthView.vue"),
        },
      ],
    },

    // ACCOUNT ROUTES
    {
      path: "/account",
      component: PublicLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: "orders",
          name: "user-orders",
          component: () => import("@/views/account/UserOrdersView.vue"),
        },
      ],
    },

    // ADMIN ROUTES
    {
      path: "/admin/login",
      name: "admin-login",
      component: () => import("@/views/admin/LoginView.vue"),
    },
    {
      path: "/admin",
      component: AdminLayout,
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: "dashboard",
          name: "admin-dashboard",
          component: () => import("@/views/admin/DashboardView.vue"), // À créer
        },
        {
          path: "products",
          name: "admin-products",
          component: () => import("@/views/admin/ProductsView.vue"), // À créer
        },
        {
          path: "orders",
          name: "admin-orders",
          component: () => import("@/views/admin/OrdersView.vue"), // À créer
        },
        // Placeholder pour les autres routes pour éviter erreurs 404 immédiates
        {
          path: "slots",
          name: "admin-slots",
          component: () => import("@/views/admin/SlotsView.vue"),
        },
        {
          path: "customers",
          name: "admin-customers",
          component: () => import("@/views/admin/CustomersView.vue"),
        },
        {
          path: "settings",
          name: "admin-settings",
          component: () => import("@/views/admin/SettingsView.vue"),
        },
      ],
    },
  ],
});

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Charger la session si pas encore fait (page reload)
  if (authStore.loading) {
    await authStore.initialize();
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);

  if (requiresAuth && !authStore.user) {
    next("/admin/login");
  } else if (requiresAdmin && !authStore.isAdmin()) {
    next("/admin/login"); // Ou page 403
  } else {
    next();
  }
});

export default router;
