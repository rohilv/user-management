<template>
  <div class="bg-white p-8 rounded shadow-md">
    <h2 class="text-2xl font-bold mb-4">Submit User Details</h2>
    <input v-model="fullName" placeholder="Full Name" class="input mb-4">
    <input v-model="email" placeholder="Email" class="input mb-4">
    <input v-model="phone" placeholder="Phone" class="input mb-4">
    
    <h3 class="text-xl font-bold mb-2">Employment History</h3>
    <div v-for="(job, index) in employmentHistory" :key="index" class="mb-4">
      <input v-model="job.company" placeholder="Company" class="input mb-2">
      <input v-model="job.position" placeholder="Position" class="input mb-2">
      <input v-model="job.startDate" type="date" placeholder="Start Date" class="input mb-2">
      <input v-model="job.endDate" type="date" placeholder="End Date" class="input mb-2">
    </div>
    <button @click="addEmploymentHistory" class="btn btn-secondary mb-4">Add Employment History</button>
    
    <h3 class="text-xl font-bold mb-2">Documents</h3>
    <input type="file" @change="handleFileUpload" multiple class="input mb-4">
    
    <button @click="submitForm" class="btn btn-primary w-full">Submit Form</button>
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
      this.documents = Array.from(event.target.files);
    },
    async submitForm() {
      const formData = new FormData();
      formData.append('fullName', this.fullName);
      formData.append('email', this.email);
      formData.append('phone', this.phone);

      // Serialize employment history manually
      this.employmentHistory.forEach((job, index) => {
        formData.append(`employmentHistory[${index}][company]`, job.company);
        formData.append(`employmentHistory[${index}][position]`, job.position);
        formData.append(`employmentHistory[${index}][startDate]`, job.startDate);
        formData.append(`employmentHistory[${index}][endDate]`, job.endDate);
      });

      // Append documents
      this.documents.forEach((file, index) => {
        formData.append(`document_${index}`, file);
      });

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