<template>
  <div class="max-w-md mx-auto bg-white p-8 rounded shadow-md">
    <h2 class="text-2xl font-bold mb-4">Login</h2>
    <input v-model="username" placeholder="Username" class="w-full p-2 mb-4 border rounded">
    <input v-model="password" type="password" placeholder="Password" class="w-full p-2 mb-4 border rounded">
    <button @click="login" class="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-2">Login</button>
    <button @click="$emit('toggle-register')" class="w-full bg-gray-300 text-gray-800 p-2 rounded hover:bg-gray-400">
      Create an Account
    </button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    async login() {
      try {
        const response = await axios.post('/api/login', {
          username: this.username,
          password: this.password
        });
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          this.$emit('login-success', response.data.token);
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please check your credentials.');
      }
    }
  }
}
</script>