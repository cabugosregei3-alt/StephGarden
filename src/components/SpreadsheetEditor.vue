<template>
  <div class="h-full flex flex-col bg-white">
    <div class="flex items-center gap-1 px-4 py-2 border-b border-gray-200 bg-gray-50">
      <button 
        @click="addRow"
        class="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        Add Row
      </button>
      <button 
        @click="addColumn"
        class="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        Add Column
      </button>
      <button 
        @click="deleteLastRow"
        class="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
        Delete Row
      </button>
      
      <div class="flex-1"></div>
      
      <div class="flex items-center gap-2">
        <span v-if="lastSaved" class="text-xs text-gray-500">Saved {{ lastSaved }}</span>
        <button 
          @click="handleSave"
          class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded font-medium text-sm transition"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
          </svg>
          Save
        </button>
      </div>
    </div>
    
    <div class="flex-1 overflow-auto p-4">
      <table class="border-collapse border border-gray-300 min-w-full">
        <thead>
          <tr class="bg-gray-100">
            <th class="w-12 h-8 border border-gray-300 bg-gray-200 text-center text-xs font-semibold text-gray-600">
              #
            </th>
            <th 
              v-for="(col, colIndex) in columns" 
              :key="colIndex"
              class="w-32 min-w-[128px] border border-gray-300 bg-gray-100 text-center text-xs font-semibold text-gray-600"
            >
              {{ getColumnLetter(colIndex) }}
            </th>
            <th class="w-12 border border-gray-300 bg-gray-100"></th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(row, rowIndex) in localContent.rows" 
            :key="rowIndex"
            class="hover:bg-blue-50"
          >
            <td class="h-10 border border-gray-300 bg-gray-100 text-center text-xs font-medium text-gray-500">
              {{ rowIndex + 1 }}
            </td>
            <td 
              v-for="(cell, colIndex) in getRowCells(row)" 
              :key="colIndex"
              class="h-10 border border-gray-300"
            >
              <input 
                v-model="localContent.rows[rowIndex][colIndex]"
                class="w-full h-full px-2 text-sm text-gray-800 focus:outline-none focus:bg-blue-50"
                @input="emitUpdate"
              />
            </td>
            <td class="h-10 border border-gray-300 bg-gray-100 text-center">
              <button 
                @click="deleteRow(rowIndex)" 
                class="p-1 hover:bg-red-100 rounded transition"
                title="Delete row"
              >
                <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  content: { type: Object, default: () => ({ rows: [['', '', ''], ['', '', ''], ['', '', '']] }) }
})

const emit = defineEmits(['update', 'save'])

const localContent = ref({ 
  rows: [['', '', ''], ['', '', ''], ['', '', '']] 
})

const lastSaved = ref('')

watch(() => props.content, (newVal) => {
  if (newVal && newVal.rows) {
    localContent.value = JSON.parse(JSON.stringify(newVal))
  }
}, { deep: true, immediate: true })

const columns = computed(() => {
  const maxCols = Math.max(3, ...localContent.value.rows.map(row => row.length))
  return Array(maxCols).fill('')
})

const getColumnLetter = (index) => {
  let letter = ''
  let num = index
  while (num >= 0) {
    letter = String.fromCharCode((num % 26) + 65) + letter
    num = Math.floor(num / 26) - 1
  }
  return letter
}

const getRowCells = (row) => {
  while (row.length < columns.value.length) {
    row.push('')
  }
  return row.slice(0, columns.value.length)
}

const addRow = () => {
  const numCols = columns.value.length
  localContent.value.rows.push(Array(numCols).fill(''))
  emitUpdate()
}

const deleteRow = (index) => {
  if (localContent.value.rows.length > 1) {
    localContent.value.rows.splice(index, 1)
    emitUpdate()
  }
}

const deleteLastRow = () => {
  if (localContent.value.rows.length > 1) {
    localContent.value.rows.pop()
    emitUpdate()
  }
}

const addColumn = () => {
  localContent.value.rows.forEach(row => row.push(''))
  emitUpdate()
}

const handleSave = () => {
  const now = new Date()
  lastSaved.value = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
  emit('save')
}

const emitUpdate = () => {
  emit('update', JSON.parse(JSON.stringify(localContent.value)))
}
</script>

<style scoped>
input[type="text"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

input:focus {
  box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.5);
}
</style>
