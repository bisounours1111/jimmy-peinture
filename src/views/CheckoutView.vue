<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";
import { supabase } from "@/lib/supabaseClient";
import SlotSelector from "@/components/SlotSelector.vue";
import {
  User,
  Calendar,
  CreditCard,
  CheckCircle,
  AlertCircle,
} from "lucide-vue-next";

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

// State du Stepper
const currentStep = ref(1);
const loading = ref(false);
const error = ref(null);
const successCode = ref(null);

// Données du formulaire
const form = ref({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
});

// Slot sélectionné
const selectedSlot = ref(null);

// Mode de paiement
const paymentMethod = ref("cash"); // 'cash' | 'stripe'

// Initialisation des données
onMounted(async () => {
  // S'assurer que le profil est chargé
  if (!authStore.user) {
    await authStore.initialize();
  }

  if (authStore.user) {
    form.value.email = authStore.user.email;

    // Pré-remplir avec les métadonnées ou le profil
    if (authStore.profile) {
      form.value.firstName = authStore.profile.first_name || "";
      form.value.lastName = authStore.profile.last_name || "";
      form.value.phone = authStore.profile.phone || "";
    }
  }
});

// Validation basique
const isStep1Valid = computed(() => {
  return (
    form.value.firstName &&
    form.value.lastName &&
    form.value.email &&
    form.value.phone
  );
});

const isStep2Valid = computed(() => {
  return selectedSlot.value !== null;
});

// Actions
const nextStep = () => {
  if (currentStep.value === 1 && isStep1Valid.value) currentStep.value = 2;
  else if (currentStep.value === 2 && isStep2Valid.value) currentStep.value = 3;
};

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--;
};

// Soumission de la commande
const submitOrder = async () => {
  if (cartStore.items.length === 0) return;

  loading.value = true;
  error.value = null;

  try {
    // 0. Mettre à jour les infos utilisateur si connecté
    if (authStore.user) {
      const { error: updateError } = await supabase
        .from("users")
        .update({
          first_name: form.value.firstName,
          last_name: form.value.lastName,
          phone: form.value.phone,
        })
        .eq("id", authStore.user.id);

      if (updateError) console.warn("Erreur mise à jour profil", updateError);
    }

    // 1. Générer code unique 6 chiffres
    const orderCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Créer la commande
    const orderData = {
      order_code: orderCode,
      user_id: authStore.user?.id || null, // Lier à l'utilisateur si connecté
      first_name: form.value.firstName,
      last_name: form.value.lastName,
      email: form.value.email,
      phone: form.value.phone,
      slot_date: selectedSlot.value.date,
      slot_start_time: selectedSlot.value.start_time + ":00", // Format HH:mm:ss
      slot_end_time: selectedSlot.value.end_time + ":00",
      total_amount: cartStore.totalPrice,
      payment_method: paymentMethod.value,
      payment_status: paymentMethod.value === "cash" ? "pending" : "paid", // Simplification
      status: "pending",
    };

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (orderError) throw orderError;

    // 3. Créer les items
    const itemsData = cartStore.items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_reference: item.reference,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsData);

    if (itemsError) throw itemsError;

    // 4. Succès
    successCode.value = orderCode;
    cartStore.clearCart();

    // Envoyer email ici (via Edge Function idéalement)
  } catch (err) {
    console.error(err);
    error.value =
      "Une erreur est survenue lors de la commande. Veuillez réessayer.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="container mx-auto px-4 py-12 max-w-4xl">
    <!-- Écran de succès -->
    <div
      v-if="successCode"
      class="text-center bg-green-50 p-8 rounded-lg border border-green-100"
    >
      <div
        class="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 text-green-600"
      >
        <CheckCircle class="w-10 h-10" />
      </div>
      <h1 class="text-3xl font-bold text-green-800 mb-4">Commande Validée !</h1>
      <p class="text-lg text-green-700 mb-6">
        Votre commande a bien été enregistrée.
      </p>

      <div
        class="bg-white p-6 rounded-lg shadow-sm inline-block mb-8 border border-green-200"
      >
        <p class="text-sm text-slate-500 uppercase tracking-wide font-semibold">
          Votre code de retrait
        </p>
        <p
          class="text-5xl font-mono font-bold text-slate-900 tracking-widest my-2"
        >
          {{ successCode }}
        </p>
      </div>

      <p class="text-slate-600 mb-8">
        Un email de confirmation a été envoyé à <strong>{{ form.email }}</strong
        >.<br />
        Merci de présenter ce code lors de votre retrait le
        <strong>{{ selectedSlot.date }} à {{ selectedSlot.start_time }}</strong
        >.
      </p>

      <div class="flex justify-center gap-4">
        <button
          @click="router.push('/')"
          class="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded font-bold transition-colors"
        >
          Retour à l'accueil
        </button>
        <button
          v-if="authStore.user"
          @click="router.push('/account/orders')"
          class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded font-bold transition-colors"
        >
          Voir mes commandes
        </button>
      </div>
    </div>

    <!-- Tunnel de commande -->
    <div v-else>
      <h1 class="text-3xl font-bold text-slate-900 mb-8">
        Finaliser ma commande
      </h1>

      <!-- Stepper Headers -->
      <div class="flex items-center mb-8">
        <div
          class="flex items-center"
          :class="currentStep >= 1 ? 'text-primary-600' : 'text-slate-400'"
        >
          <div
            class="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold mr-2"
            :class="
              currentStep >= 1
                ? 'border-primary-600 bg-primary-50'
                : 'border-slate-300'
            "
          >
            1
          </div>
          <span class="font-medium hidden sm:inline">Informations</span>
        </div>
        <div
          class="h-1 w-12 mx-2 bg-slate-200"
          :class="{ 'bg-primary-200': currentStep >= 2 }"
        ></div>
        <div
          class="flex items-center"
          :class="currentStep >= 2 ? 'text-primary-600' : 'text-slate-400'"
        >
          <div
            class="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold mr-2"
            :class="
              currentStep >= 2
                ? 'border-primary-600 bg-primary-50'
                : 'border-slate-300'
            "
          >
            2
          </div>
          <span class="font-medium hidden sm:inline">Créneau</span>
        </div>
        <div
          class="h-1 w-12 mx-2 bg-slate-200"
          :class="{ 'bg-primary-200': currentStep >= 3 }"
        ></div>
        <div
          class="flex items-center"
          :class="currentStep >= 3 ? 'text-primary-600' : 'text-slate-400'"
        >
          <div
            class="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold mr-2"
            :class="
              currentStep >= 3
                ? 'border-primary-600 bg-primary-50'
                : 'border-slate-300'
            "
          >
            3
          </div>
          <span class="font-medium hidden sm:inline">Paiement</span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Formulaire principal -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Étape 1 : Infos -->
          <div
            v-if="currentStep === 1"
            class="bg-white p-6 rounded-lg shadow-sm border border-slate-100"
          >
            <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
              <User class="w-5 h-5 text-primary-500" /> Vos coordonnées
            </h2>

            <div
              v-if="authStore.user"
              class="mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg text-sm"
            >
              👋 Bonjour
              {{ authStore.profile?.first_name || authStore.user.email }} ! Nous
              avons pré-rempli vos informations.
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1"
                  >Prénom *</label
                >
                <input
                  v-model="form.firstName"
                  type="text"
                  class="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1"
                  >Nom *</label
                >
                <input
                  v-model="form.lastName"
                  type="text"
                  class="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1"
                  >Email *</label
                >
                <input
                  v-model="form.email"
                  type="email"
                  class="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1"
                  >Téléphone *</label
                >
                <input
                  v-model="form.phone"
                  type="tel"
                  class="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <!-- Étape 2 : Créneau -->
          <div v-if="currentStep === 2" class="space-y-4">
            <h2 class="text-xl font-bold mb-2 flex items-center gap-2">
              <Calendar class="w-5 h-5 text-primary-500" /> Choix du retrait
            </h2>
            <SlotSelector v-model="selectedSlot" />
            <div
              v-if="selectedSlot"
              class="mt-4 p-4 bg-primary-50 text-primary-800 rounded border border-primary-100 flex items-center gap-2"
            >
              <CheckCircle class="w-5 h-5" />
              Créneau sélectionné : <strong>{{ selectedSlot.date }}</strong> à
              <strong>{{ selectedSlot.start_time }}</strong>
            </div>
          </div>

          <!-- Étape 3 : Paiement -->
          <div
            v-if="currentStep === 3"
            class="bg-white p-6 rounded-lg shadow-sm border border-slate-100"
          >
            <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
              <CreditCard class="w-5 h-5 text-primary-500" /> Mode de paiement
            </h2>

            <div class="space-y-4">
              <label
                class="flex items-center p-4 border rounded-lg cursor-pointer transition-colors"
                :class="
                  paymentMethod === 'cash'
                    ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                    : 'border-slate-200 hover:bg-slate-50'
                "
              >
                <input
                  type="radio"
                  v-model="paymentMethod"
                  value="cash"
                  class="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span class="ml-3">
                  <span class="block font-medium text-slate-900"
                    >Paiement sur place</span
                  >
                  <span class="block text-sm text-slate-500"
                    >Espèces ou chèque lors du retrait</span
                  >
                </span>
              </label>

              <label
                class="flex items-center p-4 border rounded-lg cursor-pointer transition-colors"
                :class="
                  paymentMethod === 'stripe'
                    ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                    : 'border-slate-200 hover:bg-slate-50'
                "
              >
                <input
                  type="radio"
                  v-model="paymentMethod"
                  value="stripe"
                  class="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span class="ml-3">
                  <span class="block font-medium text-slate-900"
                    >Carte bancaire (Stripe)</span
                  >
                  <span class="block text-sm text-slate-500"
                    >Paiement sécurisé immédiat (Mode Test)</span
                  >
                </span>
              </label>
            </div>

            <div
              v-if="error"
              class="mt-6 p-4 bg-red-50 text-red-700 rounded flex items-start gap-2"
            >
              <AlertCircle class="w-5 h-5 flex-shrink-0 mt-0.5" />
              {{ error }}
            </div>
          </div>

          <!-- Navigation boutons -->
          <div class="flex justify-between pt-6">
            <button
              v-if="currentStep > 1"
              @click="prevStep"
              class="text-slate-600 hover:text-slate-900 font-medium px-4 py-2"
            >
              Retour
            </button>
            <div v-else></div>
            <!-- Spacer -->

            <button
              v-if="currentStep < 3"
              @click="nextStep"
              :disabled="
                (currentStep === 1 && !isStep1Valid) ||
                (currentStep === 2 && !isStep2Valid)
              "
              class="bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded transition-colors"
            >
              Suivant
            </button>

            <button
              v-if="currentStep === 3"
              @click="submitOrder"
              :disabled="loading"
              class="bg-accent-500 hover:bg-accent-600 text-white font-bold py-3 px-8 rounded shadow-lg shadow-accent-500/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
            >
              <span
                v-if="loading"
                class="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"
              ></span>
              {{ loading ? "Traitement..." : "Confirmer la commande" }}
            </button>
          </div>
        </div>

        <!-- Sidebar Récap -->
        <div class="lg:col-span-1">
          <div
            class="bg-slate-50 p-6 rounded-lg sticky top-24 border border-slate-200"
          >
            <h3 class="font-bold text-slate-900 mb-4">Récapitulatif</h3>
            <div class="space-y-2 mb-4 max-h-60 overflow-y-auto pr-2">
              <div
                v-for="item in cartStore.items"
                :key="item.id"
                class="flex justify-between text-sm"
              >
                <span class="text-slate-600 truncate w-2/3"
                  >{{ item.quantity }}x {{ item.name }}</span
                >
                <span class="font-medium"
                  >{{ item.price * item.quantity }} €</span
                >
              </div>
            </div>
            <div
              class="border-t border-slate-200 pt-4 flex justify-between font-bold text-lg text-slate-900"
            >
              <span>Total à payer</span>
              <span>{{ cartStore.totalPrice }} €</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
