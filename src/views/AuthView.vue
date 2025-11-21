<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { User, Mail, Lock, Phone, ArrowRight, Loader2 } from "lucide-vue-next";

const router = useRouter();
const authStore = useAuthStore();

const isLogin = ref(true); // Toggle Login/Register
const loading = ref(false);
const error = ref(null);
const successMessage = ref(null);

const form = ref({
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phone: "",
});

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;
  successMessage.value = null;

  try {
    if (isLogin.value) {
      // CONNEXION
      await authStore.signIn(form.value.email, form.value.password);

      // Redirection intelligente
      if (authStore.isAdmin()) {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } else {
      // INSCRIPTION
      await authStore.signUp(form.value.email, form.value.password, {
        first_name: form.value.firstName,
        last_name: form.value.lastName,
        phone: form.value.phone,
      });

      successMessage.value =
        "Compte créé avec succès ! Veuillez vérifier vos emails pour confirmer votre inscription.";
      isLogin.value = true; // Retour au login
      form.value.password = ""; // Clear password
    }
  } catch (e) {
    if (e.message.includes("Invalid login credentials")) {
      error.value = "Email ou mot de passe incorrect.";
    } else if (e.message.includes("User already registered")) {
      error.value = "Cet email est déjà utilisé.";
    } else {
      error.value = e.message || "Une erreur est survenue.";
    }
  } finally {
    loading.value = false;
  }
};

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  error.value = null;
  successMessage.value = null;
};
</script>

<template>
  <div class="container mx-auto px-4 py-12 flex justify-center">
    <div
      class="w-full max-w-md bg-white rounded-lg shadow-md border border-slate-100 overflow-hidden"
    >
      <!-- Header -->
      <div class="bg-slate-50 p-6 text-center border-b border-slate-100">
        <h1 class="text-2xl font-bold text-slate-900">
          {{ isLogin ? "Bon retour parmi nous !" : "Créer un compte" }}
        </h1>
        <p class="text-slate-500 mt-2 text-sm">
          {{
            isLogin
              ? "Connectez-vous pour accéder à votre compte"
              : "Rejoignez Jimmy Peinture pour commander en ligne"
          }}
        </p>
      </div>

      <!-- Form -->
      <div class="p-8">
        <!-- Alertes -->
        <div
          v-if="error"
          class="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-start"
        >
          <span class="mr-2">⚠️</span> {{ error }}
        </div>
        <div
          v-if="successMessage"
          class="mb-6 p-4 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100 flex items-start"
        >
          <span class="mr-2">✅</span> {{ successMessage }}
        </div>

        <!-- Google Button -->
        <button
          @click="authStore.signInWithGoogle()"
          class="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-2.5 rounded hover:bg-slate-50 transition-colors flex justify-center items-center mb-6"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            class="w-5 h-5 mr-2"
            alt="Google"
          />
          Continuer avec Google
        </button>

        <div class="relative flex items-center justify-center mb-6">
          <hr class="w-full border-slate-200" />
          <span class="absolute bg-white px-3 text-xs text-slate-400 uppercase"
            >OU</span
          >
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Champs Inscription Uniquement -->
          <div v-if="!isLogin" class="grid grid-cols-2 gap-4">
            <div>
              <label
                class="block text-xs font-bold text-slate-700 uppercase mb-1"
                >Prénom</label
              >
              <div class="relative">
                <User class="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  v-model="form.firstName"
                  type="text"
                  required
                  class="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm"
                  placeholder="Jimmy"
                />
              </div>
            </div>
            <div>
              <label
                class="block text-xs font-bold text-slate-700 uppercase mb-1"
                >Nom</label
              >
              <input
                v-model="form.lastName"
                type="text"
                required
                class="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm"
                placeholder="Peinture"
              />
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1"
              >Email</label
            >
            <div class="relative">
              <Mail class="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm"
                placeholder="vous@exemple.com"
              />
            </div>
          </div>

          <!-- Téléphone (Inscription) -->
          <div v-if="!isLogin">
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1"
              >Téléphone</label
            >
            <div class="relative">
              <Phone class="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                v-model="form.phone"
                type="tel"
                required
                class="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm"
                placeholder="06 12 34 56 78"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1"
              >Mot de passe</label
            >
            <div class="relative">
              <Lock class="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                v-model="form.password"
                type="password"
                required
                class="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm"
                placeholder="••••••••"
                minlength="6"
              />
            </div>
            <p v-if="!isLogin" class="text-xs text-slate-400 mt-1">
              Au moins 6 caractères
            </p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 rounded transition-all transform active:scale-95 flex justify-center items-center mt-6"
          >
            <Loader2 v-if="loading" class="w-5 h-5 animate-spin mr-2" />
            {{ isLogin ? "Se connecter" : "S'inscrire" }}
          </button>
        </form>

        <!-- Toggle Link -->
        <div class="mt-6 text-center pt-6 border-t border-slate-100">
          <p class="text-sm text-slate-600">
            {{ isLogin ? "Pas encore de compte ?" : "Déjà inscrit ?" }}
            <button
              @click="toggleMode"
              class="text-primary-600 font-bold hover:underline ml-1"
            >
              {{ isLogin ? "Créer un compte" : "Se connecter" }}
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
