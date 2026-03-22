<template>
  <aside class="w-56 bg-dark-900 border-r border-white/5 flex flex-col h-full">
    <div class="p-4">
      <button 
        @click="$emit('createFolder')"
        class="w-full flex items-center justify-center gap-2 bg-accent-green text-white px-4 py-2.5 rounded-xl hover:opacity-90 transition font-medium"
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
          class="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 text-gray-400 transition"
          :class="{ 
            'bg-white/10 text-white': !currentFolderId,
            'text-accent-green': dropTarget === 'root'
          }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span class="truncate text-sm font-medium">Home</span>
          <span v-if="dropTarget === 'root'" class="text-xs text-accent-green ml-auto">Drop</span>
        </button>
      </div>
      
      <div v-if="rootFolders.length > 0" class="mb-2">
        <p class="px-3 py-1 text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Folders</p>
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
  </aside>
</template>

<script setup>
import FolderTree from './FolderTree.vue'

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
