<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Edit, Trash2, X, Check } from "lucide-vue-next";

const products = ref([]);
const loading = ref(true);
const showModal = ref(false);
const editingProduct = ref(null);

// Formulaire
const form = ref({
  name: "",
  reference: "",
  price: 0,
  stock: 0,
  description: "",
  image_url: "",
});

const fetchProducts = async () => {
  loading.value = true;
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (!error) products.value = data;
  loading.value = false;
};

const openModal = (product = null) => {
  if (product) {
    editingProduct.value = product;
    form.value = { ...product };
  } else {
    editingProduct.value = null;
    form.value = {
      name: "",
      reference: "",
      price: 0,
      stock: 0,
      description: "",
      image_url: "",
    };
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingProduct.value = null;
};

const saveProduct = async () => {
  try {
    const productData = { ...form.value };

    if (editingProduct.value) {
      // Update
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingProduct.value.id);
      if (error) throw error;
    } else {
      // Create
      const { error } = await supabase.from("products").insert(productData);
      if (error) throw error;
    }

    closeModal();
    fetchProducts();
  } catch (e) {
    alert("Erreur lors de l'enregistrement : " + e.message);
  }
};

const deleteProduct = async (id) => {
  if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (!error) fetchProducts();
};

onMounted(fetchProducts);
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-slate-800">Produits</h1>
      <button
        @click="openModal()"
        class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded flex items-center gap-2"
      >
        <Plus class="w-5 h-5" /> Nouveau Produit
      </button>
    </div>

    <!-- Table -->
    <div
      class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
    >
      <table class="w-full text-left">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="p-4 font-medium text-slate-600">Image</th>
            <th class="p-4 font-medium text-slate-600">Référence</th>
            <th class="p-4 font-medium text-slate-600">Nom</th>
            <th class="p-4 font-medium text-slate-600">Prix</th>
            <th class="p-4 font-medium text-slate-600">Stock</th>
            <th class="p-4 font-medium text-slate-600 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="product in products"
            :key="product.id"
            class="hover:bg-slate-50"
          >
            <td class="p-4">
              <img
                v-if="product.image_url"
                :src="product.image_url"
                class="w-12 h-12 object-cover rounded bg-slate-200"
              />
              <div
                v-else
                class="w-12 h-12 bg-slate-100 rounded flex items-center justify-center text-xs text-slate-400"
              >
                N/A
              </div>
            </td>
            <td class="p-4 text-sm font-mono text-slate-500">
              {{ product.reference }}
            </td>
            <td class="p-4 font-medium text-slate-900">{{ product.name }}</td>
            <td class="p-4">{{ product.price }} €</td>
            <td class="p-4">
              <span
                :class="
                  product.stock < 10
                    ? 'text-red-600 font-bold'
                    : 'text-green-600'
                "
              >
                {{ product.stock }}
              </span>
            </td>
            <td class="p-4 text-right space-x-2">
              <button
                @click="openModal(product)"
                class="text-slate-400 hover:text-primary-600"
              >
                <Edit class="w-5 h-5" />
              </button>
              <button
                @click="deleteProduct(product.id)"
                class="text-slate-400 hover:text-red-600"
              >
                <Trash2 class="w-5 h-5" />
              </button>
            </td>
          </tr>
          <tr v-if="products.length === 0 && !loading">
            <td colspan="6" class="p-8 text-center text-slate-500">
              Aucun produit trouvé. Commencez par en ajouter un.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Form -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div
          class="flex justify-between items-center p-6 border-b border-slate-100"
        >
          <h2 class="text-xl font-bold">
            {{ editingProduct ? "Modifier" : "Ajouter" }} un produit
          </h2>
          <button
            @click="closeModal"
            class="text-slate-400 hover:text-slate-600"
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="saveProduct" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Référence *</label>
              <input
                v-model="form.reference"
                type="text"
                required
                class="w-full border rounded p-2"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Prix (€) *</label>
              <input
                v-model="form.price"
                type="number"
                step="0.01"
                required
                class="w-full border rounded p-2"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1"
              >Nom du produit *</label
            >
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full border rounded p-2"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Image URL</label>
            <input
              v-model="form.image_url"
              type="text"
              class="w-full border rounded p-2"
              placeholder="https://..."
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Description</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full border rounded p-2"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1"
              >Stock initial *</label
            >
            <input
              v-model="form.stock"
              type="number"
              required
              class="w-full border rounded p-2"
            />
          </div>

          <div class="flex justify-end pt-4 gap-3">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded font-medium"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
