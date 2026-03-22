<template>
  <div class="pl-2">
    <div 
      v-for="folder in folders" 
      :key="folder.id"
      class="mb-0.5"
    >
      <div 
        class="flex items-center gap-1.5 px-2 py-1.5 rounded-xl hover:bg-gray-100 text-gray-600 cursor-pointer transition"
        :class="{ 
          'bg-gray-100 text-gray-700': currentFolderId === folder.id,
          'text-gray-500 bg-gray-100': dropTarget === folder.id
        }"
        draggable="true"
        @dragstart="handleDragStart($event, folder.id)"
        @dragover.prevent="handleDragOver($event, folder.id)"
        @dragleave="handleDragLeave"
        @drop="handleDrop($event, folder.id)"
        @click="$emit('select', folder.id)"
      >
        <button 
          v-if="hasChildren(folder.id)"
          @click.stop="$emit('toggle', folder.id)"
          class="p-0.5 hover:bg-gray-200 rounded"
        >
          <svg 
            class="w-3.5 h-3.5 transition-transform" 
            :class="{ 'rotate-90': expandedFolders.includes(folder.id) }"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
        <div v-else class="w-3.5"></div>
        
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" :style="{ color: getFolderColor(folder.id) }">
          <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
        </svg>
        <span class="truncate flex-1 text-xs font-medium">{{ folder.name }}</span>
        
        <button 
          v-if="dropTarget === folder.id"
          class="text-[10px] text-gray-500"
        >
          Drop
        </button>
        
        <button 
          v-else
          @click.stop="$emit('createSubfolder', folder.id)"
          class="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
        </button>
      </div>
      
      <div 
        v-if="expandedFolders.includes(folder.id) && childFolders[folder.id]"
        class="ml-2"
      >
        <FolderTree 
          :folders="childFolders[folder.id]"
          :currentFolderId="currentFolderId"
          :expandedFolders="expandedFolders"
          :childFolders="childFolders"
          :dropTarget="dropTarget"
          :folderColors="folderColors"
          :getFolderColor="getFolderColor"
          @select="$emit('select', $event)"
          @toggle="$emit('toggle', $event)"
          @drop="(targetId, draggedId) => $emit('drop', targetId, draggedId)"
          @dragover="(id) => $emit('dragover', id)"
          @dragleave="$emit('dragleave')"
          @createSubfolder="$emit('createSubfolder', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  folders: { type: Array, default: () => [] },
  currentFolderId: { type: String, default: null },
  expandedFolders: { type: Array, default: () => [] },
  childFolders: { type: Object, default: () => ({}) },
  dropTarget: { type: String, default: null },
  folderColors: { type: Object, default: () => ({}) },
  getFolderColor: { type: Function, required: true }
})

const emit = defineEmits(['select', 'toggle', 'drop', 'createSubfolder', 'dragover', 'dragleave'])

const draggedFolderId = ref(null)

const hasChildren = (folderId) => {
  return props.childFolders[folderId]?.length > 0
}

const handleDragStart = (event, folderId) => {
  draggedFolderId.value = folderId
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('application/json', JSON.stringify({ type: 'folder', id: folderId }))
}

const handleDragOver = (event, folderId) => {
  if (draggedFolderId.value && draggedFolderId.value !== folderId) {
    event.dataTransfer.dropEffect = 'move'
    emit('dragover', folderId)
  }
}

const handleDragLeave = () => {
  emit('dragleave')
}

const handleDrop = (event, folderId) => {
  emit('dragleave')
  const data = event.dataTransfer.getData('application/json')
  if (!data) return
  
  const item = JSON.parse(data)
  
  if (item.type === 'folder' && item.id !== folderId) {
    emit('drop', folderId, item.id)
  } else if (item.type === 'file') {
    emit('drop', folderId, item.id)
  }
  
  draggedFolderId.value = null
}
</script>
