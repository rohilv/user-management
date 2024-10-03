<template>
  <div class="bg-white p-8 rounded shadow-md">
    <h2 class="text-2xl font-bold mb-4">Submit User Details</h2>
    <input v-model="fullName" placeholder="Full Name" class="w-full p-2 mb-4 border rounded">
    <input v-model="email" placeholder="Email" class="w-full p-2 mb-4 border rounded">
    <input v-model="phone" placeholder="Phone" class="w-full p-2 mb-4 border rounded">
    
    <h3 class="text-xl font-bold mb-2">Employment History</h3>
    <div v-for="(job, index) in employmentHistory" :key="index" class="mb-4">
      <input v-model="job.company" placeholder="Company" class="w-full p-2 mb-2 border rounded">
      <input v-model="job.position" placeholder="Position" class="w-full p-2 mb-2 border rounded">
      <input v-model="job.startDate" type="date" placeholder="Start Date" class="w-full p-2 mb-2 border rounded">
      <input v-model="job.endDate" type="date" placeholder="End Date" class="w-full p-2 mb-2 border rounded">
    </div>
    <button @click="addEmploymentHistory" class="bg-green-500 text-white p-2 rounded hover:bg-green-600 mb-4">Add Employment History</button>
    
    <h3 class="text-xl font-bold mb-2">Documents</h3>
    <input type="file" @change="handleFileUpload" multiple class="w-full p-2 mb-4 border rounded">
    
    <button @click="submitForm" class="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Submit Form</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      fullName: '',
      email: '',
      phone: '',
      employmentHistory: [{ company: '', position: '', startDate: '', endDate: '' }],
      documents: []
    }
  },
  methods: {
    addEmploymentHistory() {
      this.employmentHistory.push({ company: '', position: '', startDate: '', endDate: '' });
    },
    handleFileUpload(event) {
      this.documents = event.target.files;
    },
    async submitForm() {
      const formData = new FormData();
      formData.append('fullName', this.fullName);
      formData.append('email', this.email);
      formData.append('phone', this.phone);
      formData.append('employmentHistory', JSON.stringify(this.employmentHistory));
      for (let i = 0; i < this.documents.length; i++) {
        formData.append('documents', this.documents[i]);
      }

      try {
        const response = await axios.post('/api/submit-form', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.status === 201) {
          alert('Form submitted successfully');
          this.resetForm();
        }
      } catch (error) {
        console.error('Form submission error:', error);
        alert('An error occurred during form submission.');
      }
    },
    resetForm() {
      this.fullName = '';
      this.email = '';
      this.phone = '';
      this.employmentHistory = [{ company: '', position: '', startDate: '', endDate: '' }];
      this.documents = [];
    }
  }
}
</script>