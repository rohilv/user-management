import { createApp } from 'vue'

const app = createApp({
  data() {
    return {
      isLoggedIn: false,
      isAdmin: false,
      isRegistering: false,
      username: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      email: '',
      phone: '',
      employmentHistory: [{ company: '', position: '', startDate: '', endDate: '' }],
      documents: [],
      userSubmissions: []
    }
  },
  methods: {
    async login() {
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: this.username, password: this.password })
        });
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('token', data.token);
          this.isLoggedIn = true;
          this.isAdmin = this.parseJwt(data.token).role === 'admin';
        } else {
          alert('Login failed. Please check your credentials.');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login.');
      }
    },
    async register() {
      if (this.password !== this.confirmPassword) {
        alert('Passwords do not match.');
        return;
      }
      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            username: this.username, 
            password: this.password,
            role: 'user' // Default role for new registrations
          })
        });
        const data = await response.json();
        if (response.ok) {
          alert('Registration successful. Please log in.');
          this.isRegistering = false;
        } else {
          alert(data.error || 'Registration failed. Please try again.');
        }
      } catch (error) {
        console.error('Registration error:', error);
        alert('An error occurred during registration.');
      }
    },
    logout() {
      localStorage.removeItem('token');
      this.isLoggedIn = false;
      this.isAdmin = false;
    },
    toggleRegister() {
      this.isRegistering = !this.isRegistering;
      this.username = '';
      this.password = '';
      this.confirmPassword = '';
    },
    addEmploymentHistory() {
      this.employmentHistory.push({ company: '', position: '', startDate: '', endDate: '' });
    },
    async submitForm() {
      const formData = new FormData();
      formData.append('fullName', this.fullName);
      formData.append('email', this.email);
      formData.append('phone', this.phone);
      formData.append('employmentHistory', JSON.stringify(this.employmentHistory));
      this.documents.forEach(doc => formData.append('documents', doc));

      try {
        const response = await fetch('/api/submit-form', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: formData
        });
        if (response.ok) {
          alert('Form submitted successfully');
          this.resetForm();
        } else {
          alert('Form submission failed. Please try again.');
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
    },
    async fetchUserSubmissions() {
      try {
        const response = await fetch('/api/user-submissions', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
          this.userSubmissions = await response.json();
        } else {
          alert('Failed to fetch user submissions. Please try again.');
        }
      } catch (error) {
        console.error('Error fetching user submissions:', error);
        alert('An error occurred while fetching user submissions.');
      }
    },
    parseJwt(token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    }
  },
  mounted() {
    const token = localStorage.getItem('token');
    if (token) {
      this.isLoggedIn = true;
      this.isAdmin = this.parseJwt(token).role === 'admin';
    }
  },
  template: `
    <div v-if="!isLoggedIn" class="max-w-md mx-auto bg-white p-8 rounded shadow-md">
      <h2 class="text-2xl font-bold mb-4">{{ isRegistering ? 'Register' : 'Login' }}</h2>
      <input v-model="username" placeholder="Username" class="w-full p-2 mb-4 border rounded">
      <input v-model="password" type="password" placeholder="Password" class="w-full p-2 mb-4 border rounded">
      <input v-if="isRegistering" v-model="confirmPassword" type="password" placeholder="Confirm Password" class="w-full p-2 mb-4 border rounded">
      <button v-if="!isRegistering" @click="login" class="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-2">Login</button>
      <button v-else @click="register" class="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 mb-2">Register</button>
      <button @click="toggleRegister" class="w-full bg-gray-300 text-gray-800 p-2 rounded hover:bg-gray-400">
        {{ isRegistering ? 'Back to Login' : 'Create an Account' }}
      </button>
    </div>

    <div v-else>
      <button @click="logout" class="bg-red-500 text-white p-2 rounded hover:bg-red-600 mb-4">Logout</button>
      
      <div v-if="!isAdmin" class="bg-white p-8 rounded shadow-md">
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
        <input type="file" @change="e => documents = e.target.files" multiple class="w-full p-2 mb-4 border rounded">
        
        <button @click="submitForm" class="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Submit Form</button>
      </div>

      <div v-if="isAdmin" class="bg-white p-8 rounded shadow-md">
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
    </div>
  `
})

app.mount('#app')