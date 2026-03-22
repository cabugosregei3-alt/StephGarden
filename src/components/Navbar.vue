<template>
  <header class="bg-black border-b border-gray-800">
    <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <router-link :to="user ? '/dashboard' : '/'" class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
          </svg>
        </div>
        <span class="text-xl font-bold text-white">Stefan Files</span>
      </router-link>
      
      <div v-if="user" class="relative">
        <button 
          @click.stop="toggleDropdown"
          class="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
        >
          <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <span class="text-sm font-semibold">{{ userInitials }}</span>
          </div>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        
        <div 
          v-if="dropdownOpen" 
          class="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-2 z-50"
        >
          <router-link 
            to="/settings" 
            @click="dropdownOpen = false"
            class="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Settings
          </router-link>
          <button 
            @click="handleLogout"
            class="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Logout
          </button>
        </div>
      </div>
      
      <router-link 
        v-else
        to="/login" 
        class="bg-green-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-green-400 transition"
      >
        Get Started
      </router-link>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()
const user = ref(null)
const dropdownOpen = ref(false)

const userInitials = computed(() => {
  const name = user.value?.user_metadata?.full_name || user.value?.email?.split('@')[0] || 'User'
  if (name === 'User') return 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const handleLogout = async () => {
  dropdownOpen.value = false
  await supabase.auth.signOut()
  router.push('/login')
}

const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    dropdownOpen.value = false
  }
}

const checkAuth = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  user.value = session?.user || null
}

onMounted(() => {
  checkAuth()
  document.addEventListener('click', handleClickOutside)
  
  supabase.auth.onAuthStateChange((event, session) => {
    user.value = session?.user || null
  })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
