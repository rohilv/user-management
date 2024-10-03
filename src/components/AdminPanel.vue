<template>
  <div class="bg-white p-8 rounded shadow-md">
    <h2 class="text-2xl font-bold mb-4">User Submissions</h2>
    <button @click="fetchUserSubmissions" class="bg-green-500 text-white p-2 rounded hover:bg-green-600 mb-4">Fetch Submissions</button>
    <div v-for="submission in userSubmissions" :key="submission.id" class="mb-4 p-4 border rounded">
      <p><strong>Name:</strong> {{ submission.full_name }}</p>
      <p><strong>Email:</strong> {{ submission.email }}</p>
      <p><strong>Phone:</strong> {{ submission.phone }}</p>
      <p><strong>Company:</strong> {{ submission.company }}</p>
      <p><strong>Position:</strong> {{ submission.position }}</p>
      <p><strong>Document:</strong> {{ submission.document_type }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      userSubmissions: []
    }
  },
  methods: {
    async fetchUserSubmissions() {
      try {
        const response = await axios.get('/api/user-submissions', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        this.userSubmissions = response.data;
      } catch (error) {
        console.error('Error fetching user submissions:', error);
        alert('An error occurred while fetching user submissions.');
      }
    }
  }
}
</script>