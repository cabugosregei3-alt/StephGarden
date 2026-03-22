<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-8">
    <div class="max-w-4xl w-full text-center">
      <div class="flex justify-center mb-8">
        <div class="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center">
          <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
          </svg>
        </div>
      </div>
      
      <h1 class="text-5xl md:text-6xl font-bold text-white mb-4">
        Stefan Files
      </h1>
      <p class="text-xl text-green-400 mb-12">
        Your all-in-one workspace for files, documents & spreadsheets
      </p>
      
      <div class="grid md:grid-cols-3 gap-6">
        <div class="bg-black/50 border border-green-500/30 p-6 rounded-xl hover:border-green-500/60 transition">
          <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-white mb-2">File Organization</h3>
          <p class="text-gray-400 text-sm">Create folders and organize your files</p>
        </div>
        
        <div class="bg-black/50 border border-green-500/30 p-6 rounded-xl hover:border-green-500/60 transition">
          <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-white mb-2">Word Processing</h3>
          <p class="text-gray-400 text-sm">Write documents with rich formatting</p>
        </div>
        
        <div class="bg-black/50 border border-green-500/30 p-6 rounded-xl hover:border-green-500/60 transition">
          <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-white mb-2">Spreadsheets</h3>
          <p class="text-gray-400 text-sm">Excel-like data management</p>
        </div>
      </div>
      
      <div class="mt-12 text-gray-500 text-sm">
        Built with Vue.js
      </div>
    </div>
  </div>
</template>
