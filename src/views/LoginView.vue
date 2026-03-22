<template>
  <div class="min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
    <div class="absolute inset-0 overflow-hidden">
      <div v-for="i in 12" :key="i" class="absolute opacity-10 animate-float" :style="getFolderStyle(i)">
        <svg class="w-16 h-16 text-green-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
        </svg>
      </div>
    </div>
    
    <div class="w-full max-w-md relative z-10">
      <div class="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
        <h2 class="text-2xl font-bold text-gray-700 text-center mb-2">Welcome Back</h2>
        <p class="text-gray-500 text-center mb-8">Sign in to your account</p>
        
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-gray-700 mb-2 text-sm font-medium">Email</label>
            <input 
              v-model="email"
              type="email" 
              required
              class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
              placeholder="you@example.com"
            >
          </div>
          
          <div>
            <label class="block text-gray-700 mb-2 text-sm font-medium">Password</label>
            <input 
              v-model="password"
              type="password" 
              required
              class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
              placeholder="Enter your password"
            >
          </div>
          
          <div v-if="error" class="text-red-500 text-sm text-center">{{ error }}</div>
          
          <button 
            type="submit" 
            :disabled="loading"
            class="w-full bg-white text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-100 transition disabled:opacity-50 shadow-sm border border-gray-200"
          >
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
        
        <p class="text-gray-500 text-center mt-6 text-sm">
          Don't have an account? 
          <router-link to="/signup" class="text-green-600 hover:underline font-medium">Sign up</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}
</style>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const getFolderStyle = (i) => {
  const positions = [
    { left: '5%', top: '10%', delay: '0s', duration: '8s' },
    { left: '15%', top: '70%', delay: '1s', duration: '7s' },
    { left: '25%', top: '30%', delay: '2s', duration: '9s' },
    { left: '35%', top: '80%', delay: '0.5s', duration: '6s' },
    { left: '50%', top: '15%', delay: '1.5s', duration: '8s' },
    { left: '60%', top: '60%', delay: '2.5s', duration: '7s' },
    { left: '70%', top: '25%', delay: '0.8s', duration: '9s' },
    { left: '80%', top: '75%', delay: '1.8s', duration: '6s' },
    { left: '90%', top: '40%', delay: '2.2s', duration: '8s' },
    { left: '10%', top: '50%', delay: '0.3s', duration: '7s' },
    { left: '45%', top: '90%', delay: '1.2s', duration: '9s' },
    { left: '85%', top: '5%', delay: '2.8s', duration: '6s' },
  ]
  const pos = positions[i - 1]
  return {
    left: pos.left,
    top: pos.top,
    animationDelay: pos.delay,
    animationDuration: pos.duration,
  }
}

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  
  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })
  
  loading.value = false
  
  if (authError) {
    error.value = authError.message
  } else {
    router.push('/dashboard')
  }
}
</script>
