<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-8">
    <div class="max-w-4xl w-full text-center">
      <div class="flex justify-center mb-8">
        <div class="w-24 h-24 bg-gradient-to-br from-white to-gray-100 rounded-2xl flex items-center justify-center shadow-lg border border-gray-200">
          <svg class="w-14 h-14 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
          </svg>
        </div>
      </div>
      
      <h1 class="text-5xl md:text-6xl font-bold text-gray-700 mb-4">
        Steph Cloud
      </h1>
      <p class="text-xl text-gray-500 mb-4">
        Your all-in-one cloud storage workspace
      </p>
      <p class="text-gray-400 mb-8">
        Store, organize, and access your files anywhere
      </p>
      
      <router-link 
        to="/login" 
        class="inline-flex items-center gap-2 bg-white text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition shadow-sm border border-gray-200 mb-12"
      >
        Get Started
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
        </svg>
      </router-link>
      
      <div class="grid md:grid-cols-4 gap-6 mb-12">
        <div class="bg-white border border-gray-200 p-6 rounded-2xl hover:shadow-lg transition shadow-sm">
          <div class="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Folders</h3>
          <p class="text-gray-500 text-sm">Organize with nested folders</p>
        </div>
        
        <div class="bg-white border border-gray-200 p-6 rounded-2xl hover:shadow-lg transition shadow-sm">
          <div class="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Drag & Drop</h3>
          <p class="text-gray-500 text-sm">Drop files to upload</p>
        </div>
        
        <div class="bg-white border border-gray-200 p-6 rounded-2xl hover:shadow-lg transition shadow-sm">
          <div class="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Documents</h3>
          <p class="text-gray-500 text-sm">Built-in word processor</p>
        </div>
        
        <div class="bg-white border border-gray-200 p-6 rounded-2xl hover:shadow-lg transition shadow-sm">
          <div class="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Multi Storage</h3>
          <p class="text-gray-500 text-sm">Connect multiple cloud accounts</p>
        </div>
      </div>
      
      <div class="flex items-center justify-center gap-4 text-gray-400 text-sm">
        <span>Powered by Supabase & Storj</span>
        <span>|</span>
        <span>Vue.js</span>
      </div>
    </div>
  </div>
</template>
