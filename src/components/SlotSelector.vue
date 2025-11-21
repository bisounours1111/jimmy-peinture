<script setup>
import { ref, onMounted, computed } from "vue";
import {
  addDays,
  format,
  parseISO,
  isBefore,
  addMinutes,
  setHours,
  setMinutes,
  isSameDay,
  startOfDay,
} from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/lib/supabaseClient";

const props = defineProps({
  modelValue: {
    type: Object, // { date, start_time, end_time }
    default: null,
  },
});

const emit = defineEmits(["update:modelValue"]);

// Configuration (Valeurs par défaut si DB vide)
const config = ref({
  slotDuration: 10,
  minBookingHours: 24,
  maxBookingWeeks: 2,
});

const timeSlotsConfig = ref([]);
const existingOrders = ref([]);
const loading = ref(true);
const selectedDate = ref(null);

// Jours disponibles (2 semaines)
const availableDays = computed(() => {
  const days = [];
  const today = new Date();
  const maxDate = addDays(today, config.value.maxBookingWeeks * 7);

  let currentDate = addDays(today, 1); // Commence demain minimum

  while (isBefore(currentDate, maxDate)) {
    // Vérifier si le jour est ouvert selon timeSlotsConfig
    // Note: 0 = Dimanche dans date-fns et DB
    const dayOfWeek = currentDate.getDay();
    const dayConfig = timeSlotsConfig.value.filter(
      (c) => c.day_of_week === dayOfWeek && c.is_active
    );

    if (dayConfig.length > 0) {
      days.push(new Date(currentDate));
    }
    currentDate = addDays(currentDate, 1);
  }
  return days;
});

// Créneaux pour le jour sélectionné
const slotsForSelectedDay = computed(() => {
  if (!selectedDate.value) return [];

  const dayOfWeek = selectedDate.value.getDay();
  const dayConfigs = timeSlotsConfig.value.filter(
    (c) => c.day_of_week === dayOfWeek
  );
  const slots = [];

  // Seuil de réservation (Maintenant + minBookingHours)
  const bookingThreshold = addMinutes(
    new Date(),
    config.value.minBookingHours * 60
  );

  dayConfigs.forEach((conf) => {
    const [startH, startM] = conf.start_time.split(":").map(Number);
    const [endH, endM] = conf.end_time.split(":").map(Number);

    let currentSlotStart = setMinutes(
      setHours(selectedDate.value, startH),
      startM
    );
    const sessionEnd = setMinutes(setHours(selectedDate.value, endH), endM);

    while (isBefore(currentSlotStart, sessionEnd)) {
      const currentSlotEnd = addMinutes(
        currentSlotStart,
        config.value.slotDuration
      );

      // Vérifier si le créneau ne dépasse pas la fin de session
      if (
        isBefore(currentSlotEnd, sessionEnd) ||
        currentSlotEnd.getTime() === sessionEnd.getTime()
      ) {
        // 1. Vérifier le délai minimum (24h)
        if (isBefore(bookingThreshold, currentSlotStart)) {
          // 2. Vérifier si déjà réservé
          const isTaken = existingOrders.value.some((order) => {
            const orderDate = parseISO(order.slot_date); // Date seulement YYYY-MM-DD
            // On doit comparer date ET heure
            if (!isSameDay(orderDate, selectedDate.value)) return false;

            // Comparaison simple des chaînes d'heures pour l'instant (HH:mm:ss)
            // Idéalement convertir en timestamps complets
            return (
              order.slot_start_time === format(currentSlotStart, "HH:mm:ss")
            );
          });

          slots.push({
            start: format(currentSlotStart, "HH:mm"),
            end: format(currentSlotEnd, "HH:mm"),
            fullDate: new Date(currentSlotStart),
            available: !isTaken,
          });
        }
      }
      currentSlotStart = currentSlotEnd;
    }
  });

  return slots;
});

const selectSlot = (slot) => {
  if (!slot.available) return;
  emit("update:modelValue", {
    date: format(selectedDate.value, "yyyy-MM-dd"),
    start_time: slot.start,
    end_time: slot.end,
  });
};

const loadData = async () => {
  loading.value = true;
  try {
    // 1. Charger Config Settings
    const { data: settingsData } = await supabase.from("settings").select("*");
    if (settingsData) {
      settingsData.forEach((s) => {
        if (s.key === "slot_duration_minutes")
          config.value.slotDuration = parseInt(s.value);
        if (s.key === "min_booking_hours")
          config.value.minBookingHours = parseInt(s.value);
        if (s.key === "max_booking_weeks")
          config.value.maxBookingWeeks = parseInt(s.value);
      });
    }

    // 2. Charger Time Slots Config
    const { data: slotsConfig } = await supabase
      .from("time_slots_config")
      .select("*");
    timeSlotsConfig.value = slotsConfig || [];

    // 3. Charger Commandes Futures (pour exclure créneaux pris)
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const { data: orders } = await supabase
      .from("orders")
      .select("slot_date, slot_start_time")
      .gte("slot_date", todayStr)
      .neq("status", "cancelled"); // Ne pas compter les annulées

    existingOrders.value = orders || [];

    // Pré-sélectionner le premier jour dispo
    if (availableDays.value.length > 0) {
      selectedDate.value = availableDays.value[0];
    }
  } catch (e) {
    console.error("Erreur chargement créneaux", e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="bg-white p-6 rounded-lg border border-slate-200">
    <h3 class="text-lg font-bold text-slate-900 mb-4">
      Choisissez votre créneau de retrait
    </h3>

    <div v-if="loading" class="flex justify-center py-8">
      <div
        class="animate-spin h-8 w-8 border-2 border-primary-500 rounded-full border-t-transparent"
      ></div>
    </div>

    <div v-else>
      <!-- Sélecteur de jour -->
      <div class="flex overflow-x-auto pb-4 mb-4 gap-2 no-scrollbar">
        <button
          v-for="day in availableDays"
          :key="day.toISOString()"
          @click="selectedDate = day"
          :class="[
            'flex-shrink-0 px-4 py-3 rounded-lg border text-center min-w-[100px] transition-colors',
            isSameDay(day, selectedDate)
              ? 'border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500'
              : 'border-slate-200 hover:border-slate-300 text-slate-600',
          ]"
        >
          <div class="text-xs font-medium uppercase">
            {{ format(day, "EEE", { locale: fr }) }}
          </div>
          <div class="text-lg font-bold">
            {{ format(day, "dd MMM", { locale: fr }) }}
          </div>
        </button>
      </div>

      <!-- Liste des créneaux -->
      <div
        v-if="slotsForSelectedDay.length > 0"
        class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2"
      >
        <button
          v-for="(slot, idx) in slotsForSelectedDay"
          :key="idx"
          @click="selectSlot(slot)"
          :disabled="!slot.available"
          :class="[
            'py-2 px-1 text-sm rounded border transition-colors text-center',
            !slot.available
              ? 'bg-slate-100 text-slate-300 border-transparent cursor-not-allowed'
              : modelValue?.start_time === slot.start &&
                modelValue?.date === format(selectedDate, 'yyyy-MM-dd')
              ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:border-primary-400 hover:text-primary-600',
          ]"
        >
          {{ slot.start }}
        </button>
      </div>
      <div v-else class="text-center py-8 text-slate-500 bg-slate-50 rounded">
        Aucun créneau disponible ce jour-là.
      </div>
    </div>
  </div>
</template>
