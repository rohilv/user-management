<template>
  <div class="max-w-md mx-auto bg-white p-8 rounded shadow-md">
    <h2 class="text-2xl font-bold mb-4">Register</h2>
    <input v-model="username" placeholder="Username" class="w-full p-2 mb-4 border rounded">
    <input v-model="password" type="password" placeholder="Password" class="w-full p-2 mb-4 border rounded">
    <input v-model="confirmPassword" type="password" placeholder="Confirm Password" class="w-full p-2 mb-4 border rounded">
    <button @click="register" class="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 mb-2">Register</button>
    <button @click="$emit('toggle-register')" class="w-full bg-gray-300 text-gray-800 p-2 rounded hover:bg-gray-400">
      Back to Login
    </button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      username: '',
      password: '',
      confirmPassword: ''
    }
  },
  methods: {
    async register() {
      if (this.password !== this.confirmPassword) {
        alert('Passwords do not match.');
        return;
      }
      try {
        const response = await axios.post('/api/register', {
          username: this.username,
          password: this.password,
          role: 'user'
        });
        if (response.status === 201) {
          alert('Registration successful. Please log in.');
          this.$emit('toggle-register');
        }
      } catch (error) {
        console.error('Registration error:', error);
        alert(error.response.data.error || 'Registration failed. Please try again.');
      }
    }
  }
}
</script>