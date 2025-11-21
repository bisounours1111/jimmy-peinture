<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { Lock } from "lucide-vue-next";

const authStore = useAuthStore();
const router = useRouter();

const email = ref("");
const password = ref("");
const error = ref(null);
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  error.value = null;

  try {
    await authStore.signIn(email.value, password.value);

    // Vérifier si admin
    if (authStore.isAdmin()) {
      router.push("/admin/dashboard");
    } else {
      await authStore.signOut();
      error.value = "Accès refusé. Ce compte n'est pas administrateur.";
    }
  } catch (e) {
    error.value = "Email ou mot de passe incorrect.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-full mb-4"
        >
          <Lock class="w-6 h-6" />
        </div>
        <h1 class="text-2xl font-bold text-slate-900">Accès Administration</h1>
        <p class="text-slate-500">Veuillez vous connecter pour continuer</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div
          v-if="error"
          class="p-3 bg-red-50 text-red-700 text-sm rounded border border-red-100"
        >
          {{ error }}
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1"
            >Email</label
          >
          <input
            v-model="email"
            type="email"
            required
            class="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="admin@jimmypeinture.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1"
            >Mot de passe</label
          >
          <input
            v-model="password"
            type="password"
            required
            class="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded transition-colors flex justify-center items-center"
        >
          <span
            v-if="loading"
            class="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent mr-2"
          ></span>
          {{ loading ? "Connexion..." : "Se connecter" }}
        </button>
      </form>
    </div>
  </div>
</template>
