import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "@/lib/supabaseClient";

export const useProductStore = defineStore("products", () => {
  const products = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function fetchProducts() {
    loading.value = true;
    error.value = null;
    try {
      const { data, error: dbError } = await supabase
        .from("products")
        .select("*")
        .order("name");

      if (dbError) throw dbError;
      products.value = data;
    } catch (err) {
      console.error("Error fetching products:", err);
      error.value = "Impossible de charger les produits.";
    } finally {
      loading.value = false;
    }
  }

  return {
    products,
    loading,
    error,
    fetchProducts,
  };
});
