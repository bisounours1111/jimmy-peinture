<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "@/lib/supabaseClient";
import { Save, Loader2 } from "lucide-vue-next";

const settings = ref([]);
const loading = ref(true);
const saving = ref(false);

const fetchSettings = async () => {
  loading.value = true;
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .order("key");

  if (!error) settings.value = data;
  loading.value = false;
};

const saveSettings = async () => {
  saving.value = true;
  try {
    // Upsert all settings
    const { error } = await supabase.from("settings").upsert(settings.value);

    if (error) throw error;
    alert("Paramètres enregistrés avec succès !");
  } catch (e) {
    alert("Erreur lors de l'enregistrement : " + e.message);
  } finally {
    saving.value = false;
  }
};

const getLabel = (key) => {
  const labels = {
    company_name: "Nom de l'entreprise",
    slot_duration_minutes: "Durée d'un créneau (minutes)",
    min_booking_hours: "Délai minimum de réservation (heures)",
    max_booking_weeks: "Plage de réservation visible (semaines)",
    open_hours_start: "Heure d'ouverture par défaut",
    open_hours_end: "Heure de fermeture par défaut",
  };
  return labels[key] || key;
};

onMounted(fetchSettings);
</script>

<template>
  <div class="max-w-4xl">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-slate-800">Paramètres Généraux</h1>
      <button
        @click="saveSettings"
        :disabled="saving"
        class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
      >
        <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
        <Save v-else class="w-4 h-4" />
        Enregistrer
      </button>
    </div>

    <div v-if="loading" class="p-12 text-center">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"
      ></div>
    </div>

    <div
      v-else
      class="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-6"
    >
      <div
        v-for="setting in settings"
        :key="setting.id"
        class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border-b border-slate-50 pb-6 last:border-0 last:pb-0"
      >
        <div class="md:col-span-1">
          <label class="block font-medium text-slate-700">{{
            getLabel(setting.key)
          }}</label>
          <p class="text-xs text-slate-500 font-mono mt-1">{{ setting.key }}</p>
        </div>
        <div class="md:col-span-2">
          <input
            v-model="setting.value"
            type="text"
            class="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
          <p v-if="setting.description" class="text-xs text-slate-500 mt-1">
            {{ setting.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

