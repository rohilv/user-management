<template>
  <div class="container mx-auto p-4">
    <nav class="mb-4">
      <router-link to="/" class="mr-4">Home</router-link>
      <router-link to="/login" v-if="!isLoggedIn" class="mr-4">Login</router-link>
      <router-link to="/register" v-if="!isLoggedIn" class="mr-4">Register</router-link>
      <router-link to="/admin" v-if="isAdmin" class="mr-4">Admin Panel</router-link>
      <button @click="logout" v-if="isLoggedIn" class="bg-red-500 text-white p-2 rounded hover:bg-red-600">Logout</button>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const isLoggedIn = ref(false);
    const isAdmin = ref(false);
    const router = useRouter();

    const checkAuth = () => {
      const token = localStorage.getItem('token');
      isLoggedIn.value = !!token;
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          isAdmin.value = payload.role === 'admin';
        } catch (error) {
          console.error('Error parsing token:', error);
          isAdmin.value = false;
        }
      }
    };

    const logout = () => {
      localStorage.removeItem('token');
      isLoggedIn.value = false;
      isAdmin.value = false;
      router.push('/login');
    };

    onMounted(checkAuth);

    return {
      isLoggedIn,
      isAdmin,
      logout
    };
  }
}
</script>