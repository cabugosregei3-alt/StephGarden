<template>
  <div class="min-h-screen pt-20 p-4 overflow-auto">
    <div class="w-full max-w-4xl mx-auto">
      <div class="bg-black/50 border border-green-500/30 rounded-2xl p-8 mb-6">
        <h2 class="text-2xl font-bold text-white text-center mb-8">Account Settings</h2>
        
        <form @submit.prevent="handleUpdate" class="space-y-6">
          <div>
            <label class="block text-gray-300 mb-2 text-sm">Full Name</label>
            <input 
              v-model="fullName"
              type="text" 
              class="w-full bg-gray-900 border border-green-500/30 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none transition"
              placeholder="Your name"
            >
          </div>
          
          <div>
            <label class="block text-gray-300 mb-2 text-sm">Email</label>
            <input 
              v-model="email"
              type="email" 
              class="w-full bg-gray-900 border border-green-500/30 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none transition"
              placeholder="you@example.com"
            >
          </div>
          
          <hr class="border-gray-700">
          
          <div>
            <label class="block text-gray-300 mb-2 text-sm">New Password (leave blank to keep current)</label>
            <input 
              v-model="newPassword"
              type="password" 
              class="w-full bg-gray-900 border border-green-500/30 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none transition"
              placeholder="Min. 6 characters"
            >
          </div>
          
          <div>
            <label class="block text-gray-300 mb-2 text-sm">Confirm New Password</label>
            <input 
              v-model="confirmPassword"
              type="password" 
              class="w-full bg-gray-900 border border-green-500/30 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none transition"
              placeholder="Confirm password"
            >
          </div>
          
          <div v-if="error" class="text-red-400 text-sm text-center">{{ error }}</div>
          <div v-if="success" class="text-green-400 text-sm text-center">{{ success }}</div>
          
          <button 
            type="submit" 
            :disabled="loading"
            class="w-full bg-green-500 text-black font-semibold py-3 rounded-lg hover:bg-green-400 transition disabled:opacity-50"
          >
            {{ loading ? 'Saving...' : 'Save Account Changes' }}
          </button>
        </form>
      </div>

      <div class="bg-black/50 border border-blue-500/30 rounded-2xl p-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-white">Storage Profiles</h2>
            <p class="text-gray-400 text-sm mt-1">Configure multiple storage connections and switch between them</p>
          </div>
          <button 
            @click="openProfileModal()"
            class="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Add Profile
          </button>
        </div>
        
        <div v-if="profiles.length === 0" class="text-center py-8 text-gray-500">
          <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z"/>
          </svg>
          <p>No storage profiles yet</p>
          <p class="text-sm mt-1">Add a profile to start uploading files</p>
        </div>
        
        <div v-else class="space-y-3">
          <div 
            v-for="profile in profiles" 
            :key="profile.id"
            class="border rounded-lg p-4 transition"
            :class="profile.is_active ? 'border-green-500 bg-green-900/20' : 'border-gray-700 hover:border-gray-600'"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div 
                  v-if="profile.is_active"
                  class="w-3 h-3 rounded-full bg-green-500"
                  title="Active"
                ></div>
                <div 
                  v-else
                  class="w-3 h-3 rounded-full border-2 border-gray-600"
                  title="Inactive"
                ></div>
                <div>
                  <p class="text-white font-medium">{{ profile.name }}</p>
                  <p class="text-gray-400 text-sm">{{ profile.provider === 'storj' ? 'Storj' : 'S3' }} - {{ profile.bucket }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button 
                  v-if="!profile.is_active"
                  @click="setActiveProfile(profile.id)"
                  class="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Set Active
                </button>
                <span v-else class="px-3 py-1 text-sm text-green-400">Active</span>
                <button 
                  @click="openProfileModal(profile)"
                  class="p-2 hover:bg-gray-700 rounded transition"
                  title="Edit"
                >
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button 
                  @click="deleteProfile(profile.id)"
                  class="p-2 hover:bg-red-500/20 rounded transition"
                  title="Delete"
                >
                  <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="showProfileModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-900 border border-blue-500/30 rounded-xl p-6 w-full max-w-md">
        <h3 class="text-xl font-bold text-white mb-4">{{ editingProfile ? 'Edit' : 'Add' }} Storage Profile</h3>
        
        <form @submit.prevent="saveProfile" class="space-y-4">
          <div>
            <label class="block text-gray-300 mb-1 text-sm">Profile Name</label>
            <input 
              v-model="profileForm.name"
              type="text" 
              required
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none transition"
              placeholder="My Storj Bucket"
            >
          </div>
          
          <div>
            <label class="block text-gray-300 mb-1 text-sm">Provider</label>
            <select 
              v-model="profileForm.provider"
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none transition"
            >
              <option value="storj">Storj</option>
              <option value="s3">S3-Compatible</option>
            </select>
          </div>
          
          <div>
            <label class="block text-gray-300 mb-1 text-sm">Endpoint</label>
            <input 
              v-model="profileForm.endpoint"
              type="url" 
              required
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none transition"
              placeholder="https://gateway.storjshare.io"
            >
          </div>
          
          <div>
            <label class="block text-gray-300 mb-1 text-sm">Region</label>
            <input 
              v-model="profileForm.region"
              type="text" 
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none transition"
              placeholder="us-east-1"
            >
          </div>
          
          <div>
            <label class="block text-gray-300 mb-1 text-sm">Access Key ID</label>
            <input 
              v-model="profileForm.access_key_id"
              type="text" 
              required
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none transition"
              placeholder="Your access key ID"
            >
          </div>
          
          <div>
            <label class="block text-gray-300 mb-1 text-sm">Secret Access Key</label>
            <input 
              v-model="profileForm.secret_access_key"
              type="password" 
              required
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none transition"
              placeholder="Your secret access key"
            >
          </div>
          
          <div>
            <label class="block text-gray-300 mb-1 text-sm">Bucket Name</label>
            <input 
              v-model="profileForm.bucket"
              type="text" 
              required
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-green-500 focus:outline-none transition"
              placeholder="your-bucket-name"
            >
          </div>
          
          <div v-if="profileError" class="text-red-400 text-sm">{{ profileError }}</div>
          
          <div class="flex gap-3 pt-2">
            <button 
              type="button"
              @click="closeProfileModal"
              class="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              :disabled="profileLoading"
              class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
            >
              {{ profileLoading ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'

const fullName = ref('')
const email = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

const profiles = ref([])
const showProfileModal = ref(false)
const editingProfile = ref(null)
const profileLoading = ref(false)
const profileError = ref('')
const profileForm = ref({
  name: '',
  provider: 'storj',
  endpoint: 'https://gateway.storjshare.io',
  region: 'us-east-1',
  access_key_id: '',
  secret_access_key: '',
  bucket: ''
})

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    fullName.value = session.user.user_metadata?.full_name || ''
    email.value = session.user.email || ''
  }
  
  await loadProfiles()
})

const loadProfiles = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return
  
  const { data } = await supabase
    .from('storage_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at')
  
  profiles.value = data || []
}

const openProfileModal = (profile = null) => {
  editingProfile.value = profile
  if (profile) {
    profileForm.value = {
      name: profile.name,
      provider: profile.provider,
      endpoint: profile.endpoint,
      region: profile.region,
      access_key_id: profile.access_key_id,
      secret_access_key: profile.secret_access_key,
      bucket: profile.bucket
    }
  } else {
    profileForm.value = {
      name: '',
      provider: 'storj',
      endpoint: 'https://gateway.storjshare.io',
      region: 'us-east-1',
      access_key_id: '',
      secret_access_key: '',
      bucket: ''
    }
  }
  profileError.value = ''
  showProfileModal.value = true
}

const closeProfileModal = () => {
  showProfileModal.value = false
  editingProfile.value = null
}

const saveProfile = async () => {
  profileError.value = ''
  profileLoading.value = true
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) throw new Error('Not authenticated')
    
    const profileData = {
      user_id: session.user.id,
      name: profileForm.value.name,
      provider: profileForm.value.provider,
      endpoint: profileForm.value.endpoint,
      region: profileForm.value.region,
      access_key_id: profileForm.value.access_key_id,
      secret_access_key: profileForm.value.secret_access_key,
      bucket: profileForm.value.bucket
    }
    
    if (editingProfile.value) {
      const { error } = await supabase
        .from('storage_profiles')
        .update(profileData)
        .eq('id', editingProfile.value.id)
      
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('storage_profiles')
        .insert(profileData)
      
      if (error) throw error
    }
    
    localStorage.setItem('storageSettingsUpdated', Date.now().toString())
    await loadProfiles()
    closeProfileModal()
    
  } catch (err) {
    profileError.value = err.message || 'Failed to save profile'
  }
  
  profileLoading.value = false
}

const deleteProfile = async (profileId) => {
  if (!confirm('Are you sure you want to delete this profile?')) return
  
  await supabase
    .from('storage_profiles')
    .delete()
    .eq('id', profileId)
  
  localStorage.setItem('storageSettingsUpdated', Date.now().toString())
  await loadProfiles()
}

const setActiveProfile = async (profileId) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return
  
  await supabase
    .from('storage_profiles')
    .update({ is_active: false })
    .eq('user_id', session.user.id)
  
  await supabase
    .from('storage_profiles')
    .update({ is_active: true })
    .eq('id', profileId)
  
  localStorage.setItem('storageSettingsUpdated', Date.now().toString())
  await loadProfiles()
}

const handleUpdate = async () => {
  error.value = ''
  success.value = ''
  loading.value = true
  
  try {
    if (newPassword.value || confirmPassword.value) {
      if (newPassword.value !== confirmPassword.value) {
        error.value = 'Passwords do not match'
        loading.value = false
        return
      }
      if (newPassword.value.length < 6) {
        error.value = 'Password must be at least 6 characters'
        loading.value = false
        return
      }
    }
    
    const updates = {
      email: email.value,
      data: { full_name: fullName.value }
    }
    
    const { error: updateError } = await supabase.auth.updateUser(updates)
    
    if (updateError) throw updateError
    
    if (newPassword.value) {
      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword.value
      })
      if (passwordError) throw passwordError
    }
    
    success.value = 'Settings updated successfully!'
    newPassword.value = ''
    confirmPassword.value = ''
    
  } catch (err) {
    error.value = err.message || 'Failed to update settings'
  }
  
  loading.value = false
}
</script>
