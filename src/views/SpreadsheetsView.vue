<template>
  <div class="flex-1 p-6 bg-gray-50">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-700">Spreadsheets</h1>
        <button class="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-100 transition shadow-sm">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          New Spreadsheet
        </button>
      </div>
      
      <div class="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="i in 3" :key="i" class="bg-white p-4 rounded-xl shadow-sm border-2 border-transparent hover:border-gray-300 hover:shadow-md transition cursor-pointer">
          <div class="w-full h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-3 flex items-center justify-center">
            <svg class="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
          </div>
          <p class="font-medium text-gray-700">{{ ['Budget 2024', 'Inventory', 'Sales Data'][i-1] }}</p>
          <p class="text-sm text-gray-400">Modified {{ ['Yesterday', '5 days ago', '2 weeks ago'][i-1] }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
