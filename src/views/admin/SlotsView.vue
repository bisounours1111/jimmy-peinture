<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "@/lib/supabaseClient";
import { Check, X, Clock, Save } from "lucide-vue-next";

const slotsConfig = ref([]);
const loading = ref(true);
const saving = ref(false);

const daysOfWeek = [
  { id: 1, name: "Lundi" },
  { id: 2, name: "Mardi" },
  { id: 3, name: "Mercredi" },
  { id: 4, name: "Jeudi" },
  { id: 5, name: "Vendredi" },
  { id: 6, name: "Samedi" },
  { id: 0, name: "Dimanche" },
];

const fetchSlotsConfig = async () => {
  loading.value = true;
  const { data, error } = await supabase
    .from("time_slots_config")
    .select("*")
    .order("day_of_week")
    .order("start_time");

  if (!error) slotsConfig.value = data;
  loading.value = false;
};

const getConfigForDay = (dayId) => {
  return slotsConfig.value.filter((c) => c.day_of_week === dayId);
};

const addSlot = (dayId) => {
  slotsConfig.value.push({
    day_of_week: dayId,
    start_time: "09:00:00",
    end_time: "12:00:00",
    is_active: true,
  });
};

const removeSlot = async (slot, index) => {
  if (slot.id) {
    // Si existe en base, on le marque pour suppression ou on supprime direct
    await supabase.from("time_slots_config").delete().eq("id", slot.id);
  }
  // Retirer de la liste locale
  const localIndex = slotsConfig.value.indexOf(slot);
  if (localIndex > -1) slotsConfig.value.splice(localIndex, 1);
};

const saveAll = async () => {
  saving.value = true;
  try {
    // Nettoyage des IDs temporaires ou undefined
    const upsertData = slotsConfig.value.map(({ id, ...rest }) => {
      return id ? { id, ...rest } : rest;
    });

    const { error } = await supabase
      .from("time_slots_config")
      .upsert(upsertData);

    if (error) throw error;
    alert("Horaires mis à jour !");
    fetchSlotsConfig(); // Refresh IDs
  } catch (e) {
    alert("Erreur : " + e.message);
  } finally {
    saving.value = false;
  }
};

onMounted(fetchSlotsConfig);
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-slate-800">Horaires d'ouverture</h1>
      <button
        @click="saveAll"
        :disabled="saving"
        class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
      >
        <Save class="w-4 h-4" />
        {{ saving ? "Enregistrement..." : "Enregistrer tout" }}
      </button>
    </div>

    <div v-if="loading" class="p-12 text-center">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"
      ></div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div
        v-for="day in daysOfWeek"
        :key="day.id"
        class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
      >
        <div
          class="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center"
        >
          <h3 class="font-bold text-slate-900">{{ day.name }}</h3>
          <button
            @click="addSlot(day.id)"
            class="text-xs font-medium text-primary-600 hover:underline"
          >
            + Ajouter plage
          </button>
        </div>

        <div class="p-4 space-y-3">
          <div
            v-if="getConfigForDay(day.id).length === 0"
            class="text-sm text-slate-400 italic text-center py-2"
          >
            Fermé
          </div>

          <div
            v-for="(slot, idx) in getConfigForDay(day.id)"
            :key="idx"
            class="flex items-center gap-3"
          >
            <div class="relative flex-grow">
              <Clock class="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                v-model="slot.start_time"
                type="time"
                class="pl-9 pr-2 py-2 border rounded w-full text-sm"
              />
            </div>
            <span class="text-slate-400">-</span>
            <div class="relative flex-grow">
              <input
                v-model="slot.end_time"
                type="time"
                class="px-2 py-2 border rounded w-full text-sm"
              />
            </div>

            <label class="flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="slot.is_active"
                class="hidden peer"
              />
              <div
                class="w-8 h-8 rounded flex items-center justify-center border border-slate-200 peer-checked:bg-green-100 peer-checked:text-green-600 peer-checked:border-green-200 text-slate-300"
              >
                <Check class="w-4 h-4" />
              </div>
            </label>

            <button
              @click="removeSlot(slot)"
              class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

