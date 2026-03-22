<template>
  <aside class="w-56 bg-white border-r border-gray-200 flex flex-col h-full">
    <div class="p-4 flex items-center gap-3">
      <div class="w-8 h-8 bg-gradient-to-br from-white to-gray-100 rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
        </svg>
      </div>
      <span class="text-base font-bold text-gray-700">STEPH CLOUD</span>
    </div>
    
    <div class="p-3">
      <button 
        @click="$emit('createFolder')"
        class="w-full flex items-center justify-center gap-2 bg-green-900 text-white px-4 py-2.5 rounded-xl hover:bg-green-600 transition font-medium shadow-sm"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        New Folder
      </button>
    </div>
    
    <div class="flex-1 overflow-y-auto p-2">
      <div class="mb-4">
        <button 
          @click="$emit('navigateRoot')"
          @dragover.prevent="$emit('dragover', null)"
          @drop="$emit('dropRoot', $event)"
          class="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-600 transition"
          :class="{ 
            'bg-white text-gray-700': !currentFolderId,
            'text-gray-700 bg-gray-100': dropTarget === 'root'
          }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span class="truncate text-sm font-medium">Home</span>
          <span v-if="dropTarget === 'root'" class="text-xs text-gray-500 ml-auto">Drop</span>
        </button>
      </div>
      
      <div v-if="rootFolders.length > 0" class="mb-2">
        <p class="px-3 py-1 text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Folders</p>
        <FolderTree 
          :folders="rootFolders"
          :currentFolderId="currentFolderId"
          :expandedFolders="expandedFolders"
          :childFolders="childFolders"
          :dropTarget="dropTarget"
          :folderColors="folderColors"
          :getFolderColor="getFolderColor"
          @select="handleSelectFolder"
          @toggle="toggleExpand"
          @drop="handleDrop"
          @dragover="(id) => $emit('dragover', id)"
          @dragleave="$emit('dragleave')"
          @createSubfolder="(parentId) => $emit('createSubfolder', parentId)"
        />
      </div>
    </div>
    
    <div class="p-2 border-t border-gray-200 space-y-1">
      <router-link 
        to="/settings" 
        class="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition"
        :class="isSettingsPage ? 'bg-green-50 text-green-600' : 'text-gray-600'"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <span class="truncate text-sm font-medium">Settings</span>
      </router-link>
      <button 
        @click="handleLogout"
        class="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-600 transition"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
        <span class="truncate text-sm font-medium">Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '../lib/supabase'
import FolderTree from './FolderTree.vue'

const router = useRouter()
const route = useRoute()

const isSettingsPage = computed(() => route.path === '/settings')

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}

const props = defineProps({
  rootFolders: { type: Array, default: () => [] },
  currentFolderId: { type: String, default: null },
  expandedFolders: { type: Array, default: () => [] },
  childFolders: { type: Object, default: () => ({}) },
  dropTarget: { type: String, default: null },
  folderColors: { type: Object, default: () => ({}) },
  getFolderColor: { type: Function, required: true }
})

const emit = defineEmits(['selectFolder', 'navigateRoot', 'createFolder', 'createSubfolder', 'drop', 'dropRoot', 'dragover', 'dragleave', 'toggleExpand'])

const handleSelectFolder = (folderId) => {
  emit('selectFolder', folderId)
}

const toggleExpand = (folderId) => {
  emit('toggleExpand', folderId)
}

const handleDrop = (folderId, draggedFolderId) => {
  emit('drop', folderId, draggedFolderId)
}
</script>
