import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "vue-router";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const profile = ref(null);
  const loading = ref(true);
  const router = useRouter();

  // Initialiser la session
  async function initialize() {
    loading.value = true;
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      user.value = session.user;
      await fetchProfile(session.user.id);

      // Si le profil n'a pas de prénom mais que les métadonnées Google en ont un, on met à jour
      if (!profile.value?.first_name && user.value.user_metadata?.full_name) {
        const fullName = user.value.user_metadata.full_name;
        const nameParts = fullName.split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ");

        const { error } = await supabase
          .from("users")
          .update({
            first_name: firstName,
            last_name: lastName,
          })
          .eq("id", user.value.id);

        if (!error) {
          // Re-fetch profil mis à jour
          await fetchProfile(user.value.id);
        }
      }
    }
    loading.value = false;

    // Écouter les changements d'auth
    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user || null;
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        profile.value = null;
      }
    });
  }

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    profile.value = data;
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  }

  async function signUp(email, password, metadata) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata, // { first_name, last_name, phone }
      },
    });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    await supabase.auth.signOut();
    user.value = null;
    profile.value = null;
    // Redirection gérée par le router ou le composant
  }

  const isAdmin = () => {
    return profile.value?.is_admin === true;
  };

  return {
    user,
    profile,
    loading,
    initialize,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    isAdmin,
  };
});
