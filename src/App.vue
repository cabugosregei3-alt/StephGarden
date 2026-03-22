<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
    <Navbar />
    <router-view />
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
</script>
