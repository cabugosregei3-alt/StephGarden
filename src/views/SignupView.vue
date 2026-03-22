<template>
  <div class="min-h-screen flex items-center justify-center pt-20 p-4">
    <div class="w-full max-w-md">
      <div class="bg-black/50 border border-green-500/30 rounded-2xl p-8">
        <h2 class="text-2xl font-bold text-white text-center mb-2">Create Account</h2>
        <p class="text-gray-400 text-center mb-8">Get started with Stefan Files</p>
        
        <form @submit.prevent="handleSignup" class="space-y-6">
          <div>
            <label class="block text-gray-300 mb-2 text-sm">Full Name</label>
            <input 
              v-model="name"
              type="text" 
              required
              class="w-full bg-gray-900 border border-green-500/30 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none transition"
              placeholder="John Doe"
            >
          </div>
          
          <div>
            <label class="block text-gray-300 mb-2 text-sm">Email</label>
            <input 
              v-model="email"
              type="email" 
              required
              class="w-full bg-gray-900 border border-green-500/30 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none transition"
              placeholder="you@example.com"
            >
          </div>
          
          <div>
            <label class="block text-gray-300 mb-2 text-sm">Password</label>
            <input 
              v-model="password"
              type="password" 
              required
              minlength="6"
              class="w-full bg-gray-900 border border-green-500/30 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none transition"
              placeholder="Min. 6 characters"
            >
          </div>
          
          <div v-if="error" class="text-red-400 text-sm text-center">{{ error }}</div>
          <div v-if="success" class="text-green-400 text-sm text-center">{{ success }}</div>
          
          <button 
            type="submit" 
            :disabled="loading"
            class="w-full bg-green-500 text-black font-semibold py-3 rounded-lg hover:bg-green-400 transition disabled:opacity-50"
          >
            {{ loading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>
        
        <p class="text-gray-400 text-center mt-6 text-sm">
          Already have an account? 
          <router-link to="/login" class="text-green-400 hover:text-green-300">Sign in</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

const handleSignup = async () => {
  error.value = ''
  success.value = ''
  loading.value = true
  
  const { data, error: authError } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      data: {
        full_name: name.value
      }
    }
  })
  
  loading.value = false
  
  if (authError) {
    error.value = authError.message
  } else if (data.session) {
    router.push('/dashboard')
  } else {
    success.value = 'Account created! Check your email to confirm.'
    setTimeout(() => router.push('/login'), 2000)
  }
}
</script>
