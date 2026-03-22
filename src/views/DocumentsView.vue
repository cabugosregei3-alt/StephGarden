<template>
  <div class="flex-1 p-6">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Documents</h1>
        <button class="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          New Document
        </button>
      </div>
      
      <div class="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="bg-white p-4 rounded-xl shadow-sm border-2 border-transparent hover:border-green-400 hover:shadow-md transition cursor-pointer">
          <div class="w-full h-32 bg-gradient-to-br from-green-50 to-green-100 rounded-lg mb-3 flex items-center justify-center">
            <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <p class="font-medium text-gray-800">{{ ['Meeting Notes', 'Project Plan', 'Research', 'Draft'][i-1] }}</p>
          <p class="text-sm text-gray-500">Modified {{ ['2 hours ago', 'Yesterday', '3 days ago', 'Last week'][i-1] }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
