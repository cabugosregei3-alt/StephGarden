<template>
  <div class="flex h-[calc(100vh-64px)]">
    <Sidebar 
      :rootFolders="rootFolders"
      :currentFolderId="currentFolderId"
      :expandedFolders="expandedFolders"
      :childFolders="childFolders"
      :dropTarget="dropTargetFolder"
      :folderColors="folderColors"
      :getFolderColor="getFolderColor"
      @selectFolder="selectFolder"
      @navigateRoot="navigateRoot"
      @createFolder="showCreateFolderModal = true"
      @createSubfolder="(parentId) => { parentFolderId = parentId; showCreateFolderModal = true; }"
      @toggleExpand="toggleExpand"
      @drop="handleSidebarDrop"
      @dropRoot="handleDropRoot"
      @dragover="dropTargetFolder = $event"
      @dragleave="dropTargetFolder = null"
    />
    
    <div v-if="notifications.length > 0" class="fixed top-20 right-4 z-50 space-y-2">
      <div 
        v-for="notif in notifications" 
        :key="notif.id"
        class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg max-w-sm"
        :class="{
          'bg-green-600 text-white': notif.type === 'success',
          'bg-red-600 text-white': notif.type === 'error',
          'bg-blue-600 text-white': notif.type === 'info',
          'bg-yellow-600 text-white': notif.type === 'warning'
        }"
      >
        <svg v-if="notif.type === 'success'" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        <svg v-else-if="notif.type === 'error'" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
        <svg v-else class="w-5 h-5 flex-shrink-0 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        <span class="flex-1 text-sm">{{ notif.message }}</span>
        <button @click="removeNotification(notif.id)" class="p-1 hover:bg-white/20 rounded">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
    
    <div v-if="isUploading || isDeleting" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-gray-900 border border-green-500/30 rounded-xl p-6 w-96">
        <div v-if="isUploading">
          <h3 class="text-xl font-bold text-white mb-2">Uploading</h3>
          <p class="text-gray-400 text-sm mb-4 truncate">{{ uploadProgress.fileName }}</p>
          <div class="w-full bg-gray-700 rounded-full h-3 mb-2">
            <div 
              class="bg-green-500 h-3 rounded-full transition-all duration-300"
              :style="{ width: uploadProgress.total > 0 ? (uploadProgress.current / uploadProgress.total * 100) + '%' : '0%' }"
            ></div>
          </div>
          <p class="text-gray-400 text-xs">{{ uploadProgress.current }} / {{ uploadProgress.total }} files</p>
        </div>
        <div v-else>
          <h3 class="text-xl font-bold text-white mb-2">Deleting</h3>
          <p class="text-gray-400 text-sm mb-4 truncate">{{ deleteConfirm.item?.name || 'Items' }}</p>
          <div class="w-full bg-gray-700 rounded-full h-3 mb-2">
            <div 
              class="bg-red-500 h-3 rounded-full transition-all duration-300"
              :style="{ width: deleteProgress.value + '%' }"
            ></div>
          </div>
          <p class="text-gray-400 text-xs">{{ isNaN(deleteProgress.value) ? 0 : Math.round(deleteProgress.value) }}% complete</p>
        </div>
      </div>
    </div>
    
    <div v-if="deleteConfirm.show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-gray-900 border border-red-500/30 rounded-xl p-6 w-96">
        <h3 class="text-xl font-bold text-white mb-2">Confirm Delete</h3>
        <p class="text-gray-400 mb-4">
          Are you sure you want to delete 
          <span class="text-white font-semibold">{{ deleteConfirm.type === 'folder' ? deleteConfirm.item?.name : deleteConfirm.item?.name }}</span>?
          <span v-if="deleteConfirm.type === 'folder'" class="text-yellow-400 text-sm block mt-1">This will also delete all files inside.</span>
        </p>
        <div class="flex gap-3">
          <button @click="deleteConfirm.show = false; deleteConfirm.item = null" class="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800">Cancel</button>
          <button @click="confirmDelete" class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
    
    <main class="flex-1 overflow-auto bg-dark-900 p-6">
      <div class="mb-6">
        <div class="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button @click="navigateRoot" class="hover:text-white transition">Home</button>
          <template v-for="(crumb, index) in breadcrumbs" :key="crumb.id">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
            <button 
              @click="selectFolder(crumb.id)" 
              class="hover:text-white transition"
              :class="{ 'text-white': index === breadcrumbs.length - 1 }"
            >
              {{ crumb.name }}
            </button>
          </template>
        </div>
        
        <div class="flex gap-3 flex-wrap">
          <button 
            @click="showCreateFolderModal = true; parentFolderId = currentFolderId"
            class="flex items-center gap-2 bg-accent-green text-white px-4 py-2.5 rounded-xl hover:opacity-90 transition font-medium"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            New Folder
          </button>
          <button 
            @click="showCreateFileModal = true; parentFileFolderId = currentFolderId"
            class="flex items-center gap-2 bg-accent-purple text-white px-4 py-2.5 rounded-xl hover:opacity-90 transition font-medium"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            New Document
          </button>
          <button 
            @click="showCreateSpreadsheetModal = true; parentSpreadsheetFolderId = currentFolderId"
            class="flex items-center gap-2 bg-accent-purple text-white px-4 py-2.5 rounded-xl hover:opacity-90 transition font-medium"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            New Spreadsheet
          </button>
          <button 
            @click="selectMode = !selectMode; selectedItems = []"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl transition font-medium"
            :class="selectMode ? 'bg-accent-green text-white hover:opacity-90' : 'bg-dark-700 text-white hover:bg-dark-600'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
            </svg>
            {{ selectMode ? 'Cancel' : 'Select' }}
          </button>
          <button 
            v-if="selectedItems.length > 0"
            @click="showMoveModal = true"
            class="flex items-center gap-2 bg-accent-purple text-white px-4 py-2.5 rounded-xl hover:opacity-90 transition font-medium"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
            </svg>
            Move to ({{ selectedItems.length }})
          </button>
          <label class="flex items-center gap-2 bg-accent-purple text-white px-4 py-2.5 rounded-xl hover:opacity-90 transition font-medium cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
            Upload File
            <input type="file" multiple @change="handleFileUpload" class="hidden" />
          </label>
        </div>
        
        <div v-if="showNoStorageWarning || !activeProfileId" class="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <div class="flex-1">
              <p class="text-yellow-300 font-medium">No storage profile active</p>
              <p class="text-gray-400 text-sm">Set up a storage profile in Settings to upload files</p>
            </div>
            <router-link to="/settings" class="px-4 py-2 bg-yellow-500 text-black text-sm font-medium rounded-lg hover:bg-yellow-400 transition">
              Go to Settings
            </router-link>
          </div>
        </div>
      </div>
      
      <div v-if="currentFolders.length === 0 && currentFiles.length === 0" 
           class="text-center py-20 text-gray-500">
        <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
        </svg>
        <p>This folder is empty</p>
        <p class="text-sm mt-2">Create a folder or add files to get started</p>
      </div>
      
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
        <div 
          v-for="folder in currentFolders" 
          :key="folder.id"
          class="bg-dark-800 border border-white/5 p-3 rounded-2xl transition-all duration-200 group relative cursor-pointer"
          :class="[
            dropTargetFolder === folder.id ? 'border-accent-green/50 bg-accent-green/10' : '',
            isSelected(folder.id, 'folder') ? 'border-accent-purple' : 'hover:border-white/10'
          ]"
          :draggable="!selectMode"
          @dragstart="handleFolderDragStart($event, folder)"
          @dragover.prevent="handleFolderDragOver($event, folder.id)"
          @dragleave="handleFolderDragLeave"
          @drop="handleFolderDrop($event, folder.id)"
          @dragend="handleDragEnd"
          @click="handleFolderItemClick(folder, $event)"
        >
          <div class="flex justify-between items-start mb-2">
            <div class="flex items-center gap-2">
              <input 
                v-if="selectMode"
                type="checkbox"
                :checked="isSelected(folder.id, 'folder')"
                @click.stop
                @change="toggleSelect(folder, 'folder')"
                class="w-4 h-4 rounded accent-accent-purple cursor-pointer"
              >
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" :style="{ color: getFolderColor(folder.id) }">
                <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
              </svg>
            </div>
            <div class="relative" @click.stop>
              <button @click="openMenuId = openMenuId === folder.id ? null : folder.id" class="p-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg transition">
                <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </button>
              <div v-if="openMenuId === folder.id" class="absolute right-0 top-7 bg-dark-700 border border-white/10 rounded-xl shadow-2xl py-1 w-32 z-20">
                <button @click="startRenameFolder(folder)" class="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Rename
                </button>
                <button @click="showDeleteConfirm('folder', folder); openMenuId = null" class="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-white/5 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
          <p v-if="renamingFolderId !== folder.id" class="text-white/90 text-xs truncate font-medium" :class="{ 'ml-6': selectMode }">{{ folder.name }}</p>
          <input 
            v-else
            v-model="renamingFolderName"
            ref="renameInput"
            class="w-full bg-dark-600 border border-accent-purple rounded-lg px-2 py-1 text-white text-xs focus:outline-none"
            @blur="saveRenameFolder"
            @keyup.enter="saveRenameFolder"
            @keyup.escape="cancelRenameFolder"
            @click.stop
          >
          <p class="text-gray-500 text-[10px] mt-1">{{ formatDate(folder.updated_at) }}</p>
          <p v-if="dropTargetFolder === folder.id" class="text-accent-green text-[10px] mt-1">Drop here</p>
        </div>
        
        <div 
          v-for="file in currentFiles" 
          :key="file.id"
          :data-file-id="file.id"
          class="bg-dark-800 border border-white/5 p-3 rounded-2xl cursor-pointer transition-all duration-200 group relative"
          :class="[
            isSelected(file.id, 'file') ? 'border-accent-purple' : 'hover:border-white/10',
          ]"
          :draggable="!selectMode"
          @dragstart="handleFileDragStart($event, file)"
          @dragend="handleDragEnd"
          @click="handleFileItemClick(file, $event)"
        >
          <div class="flex justify-between items-start mb-2">
            <div class="flex items-center gap-2">
              <input 
                v-if="selectMode"
                type="checkbox"
                :checked="isSelected(file.id, 'file')"
                @click.stop
                @change="toggleSelect(file, 'file')"
                class="w-4 h-4 rounded accent-accent-purple cursor-pointer"
              >
              <div v-if="file.type === 'image'" class="w-8 h-8 rounded-lg overflow-hidden bg-dark-600">
                <img v-if="thumbnails[file.id]" :src="thumbnails[file.id]" class="w-full h-full object-cover" />
                <svg v-else class="w-full h-full text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <div v-else-if="file.type === 'video'" class="w-8 h-8 rounded-lg overflow-hidden bg-dark-600 relative">
                <img v-if="thumbnails[file.id]" :src="thumbnails[file.id]" class="w-full h-full object-cover" />
                <svg v-else class="w-full h-full text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
                <div v-if="thumbnails[file.id]" class="absolute inset-0 flex items-center justify-center bg-black/30">
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              <svg v-else-if="file.type === 'audio'" class="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
              </svg>
              <svg v-else-if="file.type === 'docx'" class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <svg v-else-if="file.type === 'xlsx'" class="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
              <svg v-else-if="file.type === 'pdf'" class="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
              <svg v-else-if="file.type === 'pptx'" class="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/>
              </svg>
              <svg v-else-if="file.type === 'archive'" class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
              </svg>
              <svg v-else-if="file.type === 'document'" class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <svg v-else-if="file.type === 'spreadsheet'" class="w-8 h-8 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
              <svg v-else class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                v-if="['image', 'video', 'audio', 'upload'].includes(file.type)"
                @click.stop="downloadUploadedFile(file)"
                class="p-1.5 hover:bg-white/10 rounded-lg transition"
                title="Download"
              >
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
              </button>
              <button 
                @click.stop="showDeleteConfirm('file', file)"
                class="p-1.5 hover:bg-white/10 rounded-lg transition"
              >
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
          <p class="text-white/90 text-xs truncate font-medium" :class="{ 'ml-6': selectMode }">{{ file.name }}</p>
          <p class="text-gray-500 text-[10px] mt-1">{{ formatDate(file.updated_at) }}</p>
        </div>
      </div>
    </main>
    
    <div v-if="showCreateFolderModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-gray-900 border border-green-500/30 rounded-xl p-6 w-96">
        <h3 class="text-xl font-bold text-white mb-4">Create Folder</h3>
        <input 
          v-model="newFolderName"
          type="text" 
          class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
          placeholder="Folder name"
          @keyup.enter="createFolder"
        >
        <div class="flex gap-3 mt-4">
          <button @click="showCreateFolderModal = false; newFolderName = ''" class="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800">Cancel</button>
          <button @click="createFolder" class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Create</button>
        </div>
      </div>
    </div>
    
    <div v-if="showCreateFileModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-gray-900 border border-blue-500/30 rounded-xl p-6 w-96">
        <h3 class="text-xl font-bold text-white mb-4">Create Document</h3>
        <input 
          v-model="newFileName"
          type="text" 
          class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
          placeholder="Document name"
          @keyup.enter="createFile('document')"
        >
        <div class="flex gap-3 mt-4">
          <button @click="showCreateFileModal = false; newFileName = ''" class="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800">Cancel</button>
          <button @click="createFile('document')" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create</button>
        </div>
      </div>
    </div>
    
    <div v-if="showCreateSpreadsheetModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-gray-900 border border-yellow-500/30 rounded-xl p-6 w-96">
        <h3 class="text-xl font-bold text-white mb-4">Create Spreadsheet</h3>
        <input 
          v-model="newFileName"
          type="text" 
          class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-yellow-500 focus:outline-none"
          placeholder="Spreadsheet name"
          @keyup.enter="createFile('spreadsheet')"
        >
        <div class="flex gap-3 mt-4">
          <button @click="showCreateSpreadsheetModal = false; newFileName = ''" class="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800">Cancel</button>
          <button @click="createFile('spreadsheet')" class="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">Create</button>
        </div>
      </div>
    </div>
    
    <div v-if="selectedFile" class="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg w-[95vw] h-[95vh] flex flex-col overflow-hidden shadow-2xl">
        <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <input 
            v-model="selectedFile.name"
            class="bg-transparent text-xl font-bold text-gray-800 focus:outline-none border-b-2 border-transparent focus:border-green-500"
            @blur="saveFile"
            placeholder="Document name"
          >
          <div class="flex gap-2">
            <button v-if="selectedFile.type === 'image' || selectedFile.type === 'video'" @click="downloadUploadedFile(selectedFile)" class="p-2 hover:bg-gray-200 rounded-lg transition text-gray-600" title="Download">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
            </button>
            <button @click="selectedFile = null" class="p-2 hover:bg-gray-200 rounded-lg transition text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="flex-1 overflow-hidden">
          <DocumentEditor v-if="selectedFile.type === 'document'" :content="selectedFile.content" @update="updateFileContent" @save="saveFile" />
          <SpreadsheetEditor v-else-if="selectedFile.type === 'spreadsheet'" :content="selectedFile.content" @update="updateFileContent" @save="saveFile" />
          <div v-else-if="selectedFile.type === 'image'" class="flex items-center justify-center h-full bg-gray-100 p-4">
            <img :src="previewUrl" :alt="selectedFile.name" class="max-w-full max-h-full object-contain" />
          </div>
          <div v-else-if="selectedFile.type === 'video'" class="flex items-center justify-center h-full bg-gray-100 p-4">
            <video :src="previewUrl" controls class="max-w-full max-h-full" />
          </div>
          <div v-else-if="selectedFile.type === 'audio'" class="flex items-center justify-center h-full bg-gray-100 p-4">
            <div class="text-center">
              <svg class="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
              </svg>
              <audio :src="previewUrl" controls class="w-full max-w-md" />
              <p class="text-gray-600 mt-4">{{ selectedFile.name }}</p>
            </div>
          </div>
          <div v-else class="flex items-center justify-center h-full bg-gray-100 p-4">
            <div class="text-center">
              <svg class="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
              <p class="text-gray-600 mb-4">Preview not available for this file type</p>
              <button @click="downloadUploadedFile(selectedFile)" class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                Download File
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="showMoveModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-gray-900 border border-blue-500/30 rounded-xl p-6 w-[28rem] max-h-[80vh] flex flex-col">
        <h3 class="text-xl font-bold text-white mb-4">Move to</h3>
        <div class="flex-1 overflow-auto max-h-80 border border-gray-700 rounded-lg p-2 space-y-1">
          <button 
            @click="moveDestinationId = null"
            class="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition"
            :class="moveDestinationId === null ? 'bg-green-600 text-white' : 'hover:bg-gray-800 text-gray-300'"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
            </svg>
            Root (Home)
          </button>
          <template v-for="folder in allFolders" :key="folder.id">
            <button 
              v-if="!isSelected(folder.id, 'folder')"
              @click="moveDestinationId = folder.id"
              class="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition"
              :class="moveDestinationId === folder.id ? 'bg-green-600 text-white' : 'hover:bg-gray-800 text-gray-300'"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" :style="{ color: getFolderColor(folder.id) }">
                <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
              </svg>
              {{ folder.name }}
            </button>
          </template>
        </div>
        <div class="flex gap-3 mt-4">
          <button @click="showMoveModal = false; moveDestinationId = null" class="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800">Cancel</button>
          <button @click="moveSelectedItems" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Move Here</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, shallowRef } from 'vue'

let clickTimeout = null
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar.vue'
import DocumentEditor from '../components/DocumentEditor.vue'
import SpreadsheetEditor from '../components/SpreadsheetEditor.vue'

const user = ref(null)
const rootFolders = ref([])
const allFolders = ref([])
const childFolders = ref({})
const currentFiles = ref([])
const currentFolderId = ref(null)
const expandedFolders = ref([])
const notifications = ref([])

let notifId = 0

const getRandomPastelGreen = () => {
  const hue = 100 + Math.floor(Math.random() * 80)
  const sat = 40 + Math.floor(Math.random() * 30)
  const light = 55 + Math.floor(Math.random() * 25)
  return `hsl(${hue}, ${sat}%, ${light}%)`
}

const getFolderColor = (folderId) => {
  if (!folderColors.value[folderId]) {
    folderColors.value[folderId] = getRandomPastelGreen()
  }
  return folderColors.value[folderId]
}

const showNotification = (message, type = 'info') => {
  const id = ++notifId
  notifications.value.push({ id, message, type })
  setTimeout(() => removeNotification(id), type === 'info' ? 3000 : 5000)
}

const removeNotification = (id) => {
  notifications.value = notifications.value.filter(n => n.id !== id)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString()
}
const breadcrumbs = ref([])

const showCreateFolderModal = ref(false)
const showCreateFileModal = ref(false)
const showCreateSpreadsheetModal = ref(false)
const newFolderName = ref('')
const newFileName = ref('')
const parentFolderId = ref(null)
const parentFileFolderId = ref(null)
const parentSpreadsheetFolderId = ref(null)
const selectedFile = ref(null)
const previewUrl = ref('')
const dropTargetFolder = ref(null)
const draggedItem = ref(null)
const draggedType = ref(null)
const thumbnails = shallowRef({})
const folderColors = shallowRef({})
const renamingFolderId = ref(null)
const renamingFolderName = ref('')
const renameInput = ref(null)
const openMenuId = ref(null)
const selectMode = ref(false)
const selectedItems = ref([])
const showMoveModal = ref(false)
const moveDestinationId = ref(null)
const uploadProgress = ref({ current: 0, total: 0, fileName: '' })
const isUploading = ref(false)
const deleteConfirm = ref({ show: false, type: null, item: null })
const deleteProgress = ref(0)
const isDeleting = ref(false)
const activeProfileId = ref(null)
const showNoStorageWarning = ref(false)
const cachedActiveProfile = ref(null)

const currentFolders = computed(() => {
  if (!currentFolderId.value) return rootFolders.value
  return allFolders.value.filter(f => f.parent_id === currentFolderId.value)
})

const userName = computed(() => {
  if (!user.value) return 'User'
  return user.value.user_metadata?.full_name || user.value.email?.split('@')[0] || 'User'
})

const isSelected = computed(() => {
  const selected = new Set(selectedItems.value.map(i => `${i.type}-${i.id}`))
  return (id, type) => selected.has(`${type}-${id}`)
})

const getActiveProfile = async () => {
  if (!user.value) return null
  if (cachedActiveProfile.value) return cachedActiveProfile.value
  
  const { getActiveProfileId } = await import('../lib/storage.js')
  cachedActiveProfile.value = await getActiveProfileId()
  return cachedActiveProfile.value
}

const loadFolders = async () => {
  if (!user.value) return
  
  const activeProfile = await getActiveProfile()
  
  let query = supabase
    .from('folders')
    .select('*')
    .eq('user_id', user.value.id)
    .order('name')
  
  if (activeProfile) {
    query = query.eq('storage_profile_id', activeProfile)
  } else {
    query = query.is('storage_profile_id', null)
  }
  
  const { data, error } = await query
  
  if (!error && data) {
    allFolders.value = data
    rootFolders.value = data.filter(f => !f.parent_id)
    
    const children = {}
    data.forEach(f => {
      if (f.parent_id) {
        if (!children[f.parent_id]) children[f.parent_id] = []
        children[f.parent_id].push(f)
      }
    })
    childFolders.value = children
  }
}

const loadFiles = async () => {
  if (!user.value) return
  
  const activeProfile = await getActiveProfile()
  activeProfileId.value = activeProfile
  
  let query = supabase
    .from('files')
    .select('*')
    .eq('user_id', user.value.id)
    .order('name')
  
  if (activeProfile) {
    query = query.eq('storage_profile_id', activeProfile)
  } else {
    query = query.is('storage_profile_id', null)
  }
  
  if (currentFolderId.value) {
    query = query.eq('folder_id', currentFolderId.value)
  } else {
    query = query.is('folder_id', null)
  }
  
  const { data, error } = await query
  
  if (!error && data) {
    currentFiles.value = data
    thumbnails.value = {}
  }
}

const loadThumbnails = async (files) => {
  if (!files || files.length === 0) return
  
  const mediaFiles = files.filter(f => 
    (f.type === 'image' || f.type === 'video') && 
    f.content?.storage_path && 
    !thumbnails.value[f.id]
  )
  
  if (mediaFiles.length === 0) return
  
  const { getDownloadUrl } = await import('../lib/storage.js')
  
  const thumbPromises = mediaFiles.slice(0, 10).map(async (file) => {
    try {
      const url = await getDownloadUrl(file.content.storage_path)
      return [file.id, url]
    } catch (err) {
      return [file.id, null]
    }
  })
  
  const results = await Promise.all(thumbPromises)
  const newThumbs = Object.fromEntries(results.filter(([_, v]) => v))
  thumbnails.value = { ...thumbnails.value, ...newThumbs }
}

const selectFolder = async (folderId) => {
  currentFolderId.value = folderId
  await loadFiles()
  updateBreadcrumbs()
}

const navigateRoot = async () => {
  currentFolderId.value = null
  await loadFiles()
  breadcrumbs.value = []
}

const toggleExpand = (folderId) => {
  const index = expandedFolders.value.indexOf(folderId)
  if (index === -1) {
    expandedFolders.value.push(folderId)
  } else {
    expandedFolders.value.splice(index, 1)
  }
}

const updateBreadcrumbs = async () => {
  if (!currentFolderId.value) {
    breadcrumbs.value = []
    return
  }
  
  const crumbs = []
  let current = allFolders.value.find(f => f.id === currentFolderId.value)
  
  while (current) {
    crumbs.unshift({ id: current.id, name: current.name })
    current = current.parent_id ? allFolders.value.find(f => f.id === current.parent_id) : null
  }
  
  breadcrumbs.value = crumbs
}

const createFolder = async () => {
  if (!newFolderName.value.trim() || !user.value) return
  
  const { getActiveProfileId } = await import('../lib/storage.js')
  const storageProfileId = await getActiveProfileId()
  
  const { data, error } = await supabase
    .from('folders')
    .insert({
      user_id: user.value.id,
      parent_id: parentFolderId.value,
      name: newFolderName.value.trim(),
      storage_profile_id: storageProfileId
    })
    .select()
    .single()
  
  if (!error) {
    await loadFolders()
    if (parentFolderId.value) {
      if (!expandedFolders.value.includes(parentFolderId.value)) {
        expandedFolders.value.push(parentFolderId.value)
      }
    }
  }
  
  showCreateFolderModal.value = false
  newFolderName.value = ''
  parentFolderId.value = null
}

const createFile = async (type) => {
  if (!newFileName.value.trim() || !user.value) return
  
  const { getActiveProfileId } = await import('../lib/storage.js')
  const storageProfileId = await getActiveProfileId()
  
  if (!storageProfileId) {
    showNotification('Please set up an active storage profile in Settings first', 'warning')
    showCreateFileModal.value = false
    showCreateSpreadsheetModal.value = false
    return
  }
  
  const folderId = type === 'spreadsheet' ? parentSpreadsheetFolderId.value : parentFileFolderId.value
  
  const { data, error } = await supabase
    .from('files')
    .insert({
      user_id: user.value.id,
      folder_id: folderId,
      name: newFileName.value.trim(),
      type: type,
      storage_profile_id: storageProfileId,
      content: type === 'document' ? { text: '' } : { rows: [['', '', ''], ['', '', ''], ['', '', '']] }
    })
    .select()
    .single()
  
  if (!error) {
    await loadFiles()
  }
  
  showCreateFileModal.value = false
  showCreateSpreadsheetModal.value = false
  newFileName.value = ''
  parentFileFolderId.value = null
  parentSpreadsheetFolderId.value = null
}

const performDeleteFolder = async (folderId) => {
  const { deleteFileFromStorage } = await import('../lib/storage.js')
  
  const getAllFilesInFolder = async (id) => {
    const { data } = await supabase.from('files').select('*').eq('folder_id', id)
    return data || []
  }
  
  const getAllSubfolderIds = async (id) => {
    const { data } = await supabase.from('folders').select('id').eq('parent_id', id)
    const ids = (data || []).map(f => f.id)
    for (const subId of ids) {
      const subIds = await getAllSubfolderIds(subId)
      ids.push(...subIds)
    }
    return ids
  }
  
  const folderIds = [folderId, ...await getAllSubfolderIds(folderId)]
  
  let allFiles = []
  for (const fid of folderIds) {
    const files = await getAllFilesInFolder(fid)
    allFiles.push(...files)
  }
  
  const totalItems = allFiles.length + folderIds.length
  let completed = 0
  
  if (totalItems === 0) {
    deleteProgress.value = 100
  }
  
  for (const file of allFiles) {
    if (file.content?.storage_path) {
      try {
        await deleteFileFromStorage(file.content.storage_path)
      } catch (err) {
        console.error('Failed to delete from storage:', err)
      }
    }
    completed++
    deleteProgress.value = totalItems > 0 ? (completed / totalItems) * 100 : 100
  }
  
  for (const fid of folderIds) {
    await supabase.from('folders').delete().eq('id', fid)
    completed++
    deleteProgress.value = (completed / totalItems) * 100
  }
  
  await loadFolders()
  if (currentFolderId.value === folderId) {
    await navigateRoot()
  }
}

const deleteFolder = async (folderId) => {
  const { deleteFileFromStorage } = await import('../lib/storage.js')
  
  const getAllFilesInFolder = async (id) => {
    const { data } = await supabase.from('files').select('*').eq('folder_id', id)
    return data || []
  }
  
  const getAllSubfolderIds = async (id) => {
    const { data } = await supabase.from('folders').select('id').eq('parent_id', id)
    const ids = (data || []).map(f => f.id)
    for (const subId of ids) {
      const subIds = await getAllSubfolderIds(subId)
      ids.push(...subIds)
    }
    return ids
  }
  
  const folderIds = [folderId, ...await getAllSubfolderIds(folderId)]
  
  let allFiles = []
  for (const fid of folderIds) {
    const files = await getAllFilesInFolder(fid)
    allFiles.push(...files)
  }
  
  for (const file of allFiles) {
    if (file.content?.storage_path) {
      try {
        await deleteFileFromStorage(file.content.storage_path)
      } catch (err) {
        console.error('Failed to delete from storage:', err)
      }
    }
  }
  
  await supabase.from('folders').delete().eq('id', folderId)
  await loadFolders()
  if (currentFolderId.value === folderId) {
    await navigateRoot()
  }
}

const startRenameFolder = (folder) => {
  openMenuId.value = null
  renamingFolderId.value = folder.id
  renamingFolderName.value = folder.name
  nextTick(() => {
    if (renameInput.value) {
      const input = Array.isArray(renameInput.value) ? renameInput.value[0] : renameInput.value
      input?.focus()
      input?.select()
    }
  })
}

const saveRenameFolder = async () => {
  if (!renamingFolderId.value || !renamingFolderName.value.trim()) {
    cancelRenameFolder()
    return
  }
  
  await supabase
    .from('folders')
    .update({ name: renamingFolderName.value.trim(), updated_at: new Date().toISOString() })
    .eq('id', renamingFolderId.value)
  
  await loadFolders()
  cancelRenameFolder()
}

const cancelRenameFolder = () => {
  renamingFolderId.value = null
  renamingFolderName.value = ''
}

const toggleSelect = (item, type) => {
  const index = selectedItems.value.findIndex(i => i.id === item.id)
  if (index === -1) {
    selectedItems.value.push({ id: item.id, type })
  } else {
    selectedItems.value.splice(index, 1)
  }
}

const handleFolderItemClick = (folder, event) => {
  if (selectMode.value) {
    toggleSelect(folder, 'folder')
  } else {
    handleFolderClick(folder.id)
  }
}

const handleFileItemClick = (file, event) => {
  if (selectMode.value) {
    toggleSelect(file, 'file')
  } else {
    openFile(file)
  }
}

const moveSelectedItems = async () => {
  if (moveDestinationId.value === null) {
    for (const item of selectedItems.value) {
      if (item.type === 'folder') {
        await supabase.from('folders').update({ parent_id: null }).eq('id', item.id)
      } else {
        await supabase.from('files').update({ folder_id: null }).eq('id', item.id)
      }
    }
  } else {
    for (const item of selectedItems.value) {
      if (item.type === 'folder') {
        await supabase.from('folders').update({ parent_id: moveDestinationId.value }).eq('id', item.id)
      } else {
        await supabase.from('files').update({ folder_id: moveDestinationId.value }).eq('id', item.id)
      }
    }
  }
  
  selectedItems.value = []
  showMoveModal.value = false
  moveDestinationId.value = null
  selectMode.value = false
  await loadFolders()
  await loadFiles()
  showNotification('Items moved successfully', 'success')
}

const showDeleteConfirm = (type, item) => {
  deleteConfirm.value = { show: true, type, item }
}

const confirmDelete = async () => {
  const { type, item } = deleteConfirm.value
  deleteConfirm.value.show = false
  isDeleting.value = true
  deleteProgress.value = 0
  
  try {
    if (type === 'folder') {
      await performDeleteFolder(item.id)
    } else {
      await performDeleteFile(item.id)
    }
  } finally {
    isDeleting.value = false
    deleteProgress.value = 0
    deleteConfirm.value = { show: false, type: null, item: null }
  }
}

const handleFolderClick = (folderId) => {
  if (clickTimeout) {
    clearTimeout(clickTimeout)
    clickTimeout = null
    return
  }
  
  clickTimeout = setTimeout(() => {
    if (renamingFolderId.value !== folderId) {
      selectFolder(folderId)
    }
    clickTimeout = null
  }, 250)
}

const performDeleteFile = async (fileId) => {
  const file = currentFiles.value.find(f => f.id === fileId)
  
  deleteProgress.value = 0
  
  if (file?.content?.storage_path) {
    try {
      const { deleteFileFromStorage } = await import('../lib/storage.js')
      deleteProgress.value = 50
      await deleteFileFromStorage(file.content.storage_path)
    } catch (err) {
      console.error('Failed to delete from storage:', err)
    }
  }
  
  deleteProgress.value = 75
  await supabase.from('files').delete().eq('id', fileId)
  deleteProgress.value = 100
  await loadFiles()
}

const deleteFile = async (fileId) => {
  const file = currentFiles.value.find(f => f.id === fileId)
  
  if (file?.content?.storage_path) {
    try {
      const { deleteFileFromStorage } = await import('../lib/storage.js')
      await deleteFileFromStorage(file.content.storage_path)
    } catch (err) {
      console.error('Failed to delete from storage:', err)
    }
  }
  
  await supabase.from('files').delete().eq('id', fileId)
  await loadFiles()
}

const handleFileUpload = async (event) => {
  const files = event.target.files
  if (!files || !user.value) return
  
  const { getActiveProfileId } = await import('../lib/storage.js')
  const storageProfileId = await getActiveProfileId()
  
  if (!storageProfileId) {
    showNotification('Please set up an active storage profile in Settings first', 'warning')
    showNoStorageWarning.value = true
    event.target.value = ''
    return
  }
  
  const folderId = currentFolderId.value
  const totalFiles = files.length
  let currentFile = 0
  
  isUploading.value = true
  showNoStorageWarning.value = false
  uploadProgress.value = { current: 0, total: totalFiles, fileName: 'Starting...' }
  
  for (const file of files) {
    currentFile++
    uploadProgress.value = { current: currentFile, total: totalFiles, fileName: file.name }
    
    const fileType = getFileCategory(file.type)
    
    const { data, error } = await supabase
      .from('files')
      .insert({
        user_id: user.value.id,
        folder_id: folderId,
        name: file.name,
        type: fileType,
        storage_profile_id: storageProfileId,
        content: { size: file.size, mime_type: file.type }
      })
      .select()
      .single()
    
    if (error) {
      console.error('Insert error:', error)
      continue
    }
    
    if (data) {
      const reader = new FileReader()
      const fileData = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result)
        reader.readAsArrayBuffer(file)
      })
      await uploadToStorage(data.id, file.name, fileData, file.type)
    }
  }
  
  isUploading.value = false
  uploadProgress.value = { current: 0, total: 0, fileName: '' }
  await loadFiles()
  event.target.value = ''
}

const getFileCategory = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'docx'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'xlsx'
  if (mimeType.includes('pdf')) return 'pdf'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'pptx'
  if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('rar')) return 'archive'
  if (mimeType.includes('text/')) return 'text'
  return 'upload'
}

const uploadToStorage = async (fileId, fileName, data, mimeType) => {
  try {
    const { uploadFileToStorage } = await import('../lib/storage.js')
    const { key } = await uploadFileToStorage(data, fileName, mimeType, user.value.id)
    await supabase
      .from('files')
      .update({ content: { storage_path: key } })
      .eq('id', fileId)
    showNotification(`${fileName} uploaded successfully`, 'success')
  } catch (err) {
    console.error('Upload failed:', err)
    showNotification(`Failed to upload ${fileName}`, 'error')
  }
}

const downloadUploadedFile = async (file) => {
  if (!file.content?.storage_path) return
  
  showNotification(`Downloading ${file.name}...`, 'info')
  
  try {
    const { getDownloadUrl } = await import('../lib/storage.js')
    const url = await getDownloadUrl(file.content.storage_path)
    
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    link.click()
    showNotification(`${file.name} downloaded`, 'success')
  } catch (err) {
    console.error('Download failed:', err)
    showNotification(`Failed to download ${file.name}`, 'error')
  }
}

const openFile = async (file) => {
  if (['image', 'video', 'audio'].includes(file.type) && file.content?.storage_path) {
    try {
      const { getDownloadUrl } = await import('../lib/storage.js')
      previewUrl.value = await getDownloadUrl(file.content.storage_path)
    } catch (err) {
      console.error('Failed to load preview:', err)
    }
  } else if (file.type === 'upload' && file.content?.storage_path) {
    try {
      const { getDownloadUrl } = await import('../lib/storage.js')
      previewUrl.value = await getDownloadUrl(file.content.storage_path)
    } catch (err) {
      console.error('Failed to load preview:', err)
    }
  }
  selectedFile.value = { ...file }
}

const updateFileContent = (content) => {
  if (selectedFile.value) {
    selectedFile.value.content = content
  }
}

const saveFile = async () => {
  if (!selectedFile.value) return
  
  await supabase
    .from('files')
    .update({ 
      name: selectedFile.value.name,
      content: selectedFile.value.content,
      updated_at: new Date().toISOString()
    })
    .eq('id', selectedFile.value.id)
  
  await loadFiles()
  selectedFile.value = null
}

const moveFolder = async (targetId, draggedId) => {
  await supabase
    .from('folders')
    .update({ parent_id: targetId })
    .eq('id', draggedId)
  
  await loadFolders()
}

const moveFile = async (folderId, fileId) => {
  await supabase
    .from('files')
    .update({ folder_id: folderId })
    .eq('id', fileId)
  
  await loadFiles()
}

const handleFolderDragStart = (event, folder) => {
  draggedItem.value = folder
  draggedType.value = 'folder'
  event.dataTransfer.setData('application/json', JSON.stringify({ type: 'folder', id: folder.id }))
  event.dataTransfer.effectAllowed = 'move'
}

const handleFileDragStart = (event, file) => {
  draggedItem.value = file
  draggedType.value = 'file'
  event.dataTransfer.setData('application/json', JSON.stringify({ type: 'file', id: file.id }))
  event.dataTransfer.effectAllowed = 'move'
}

const handleFolderDragOver = (event, folderId) => {
  dropTargetFolder.value = folderId
  event.dataTransfer.dropEffect = 'move'
}

const handleFolderDragLeave = () => {
  dropTargetFolder.value = null
}

const handleFolderDrop = async (event, folderId) => {
  event.preventDefault()
  dropTargetFolder.value = null
  
  const data = event.dataTransfer.getData('application/json')
  if (!data) return
  
  const item = JSON.parse(data)
  
  if (item.type === 'folder' && item.id !== folderId) {
    await moveFolder(folderId, item.id)
  } else if (item.type === 'file') {
    await moveFile(folderId, item.id)
  }
}

const handleDragEnd = () => {
  draggedItem.value = null
  draggedType.value = null
  dropTargetFolder.value = null
}

const handleSidebarDrop = async (folderId, draggedId) => {
  await moveFolder(folderId, draggedId)
}

const handleDropRoot = async () => {
  const data = event.dataTransfer?.getData('application/json')
  if (data) {
    const item = JSON.parse(data)
    if (item.type === 'file') {
      await moveFile(null, item.id)
    }
  }
  dropTargetFolder.value = null
}

const checkActiveProfile = async () => {
  cachedActiveProfile.value = null
  const { getActiveProfileId } = await import('../lib/storage.js')
  activeProfileId.value = await getActiveProfileId()
}

let thumbnailObserver = null

const setupThumbnailObserver = () => {
  if (thumbnailObserver) {
    thumbnailObserver.disconnect()
  }
  
  thumbnailObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fileId = entry.target.dataset.fileId
        const file = currentFiles.value.find(f => f.id === fileId)
        if (file && !thumbnails.value[fileId]) {
          loadSingleThumbnail(file)
        }
      }
    })
  }, { rootMargin: '100px' })
  
  document.querySelectorAll('[data-file-id]').forEach(el => {
    thumbnailObserver.observe(el)
  })
}

const loadSingleThumbnail = async (file) => {
  if (!file || thumbnails.value[file.id]) return
  if (file.type !== 'image' && file.type !== 'video') return
  if (!file.content?.storage_path) return
  
  try {
    const { getDownloadUrl } = await import('../lib/storage.js')
    const url = await getDownloadUrl(file.content.storage_path)
    thumbnails.value[file.id] = url
  } catch (err) {
    console.error('Failed to load thumbnail:', err)
  }
}

let isMounted = false

onMounted(async () => {
  if (isMounted) return
  isMounted = true
  
  document.addEventListener('click', () => {
    openMenuId.value = null
  })
  
  const { data: { session } } = await supabase.auth.getSession()
  user.value = session?.user || null
  
  if (user.value) {
    await checkActiveProfile()
    await loadFolders()
    await loadFiles()
  }
  
  setTimeout(setupThumbnailObserver, 100)
})

watch(currentFiles, () => {
  setTimeout(setupThumbnailObserver, 50)
})
</script>
