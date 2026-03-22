<template>
  <div class="h-full flex flex-col bg-white">
    <div class="bg-gray-100 border-b border-gray-200 p-2 flex flex-wrap items-center gap-1">
      <div class="flex items-center gap-1 pr-2 border-r border-gray-300">
        <button 
          @click="editor?.chain().focus().undo().run()" 
          :disabled="!editor?.can().undo()"
          class="p-2 hover:bg-gray-200 rounded disabled:opacity-40"
          title="Undo"
        >
          <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
          </svg>
        </button>
        <button 
          @click="editor?.chain().focus().redo().run()" 
          :disabled="!editor?.can().redo()"
          class="p-2 hover:bg-gray-200 rounded disabled:opacity-40"
          title="Redo"
        >
          <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"/>
          </svg>
        </button>
      </div>
      
      <div class="flex items-center gap-1 px-2 border-r border-gray-300">
        <select 
          v-model="headingLevel"
          @change="setHeading"
          class="bg-white text-gray-700 text-sm px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
        >
          <option value="0">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
          <option value="5">Heading 5</option>
          <option value="6">Heading 6</option>
        </select>
      </div>
      
      <div class="flex items-center gap-0.5 px-2 border-r border-gray-300">
        <button 
          @click="editor?.chain().focus().toggleBold().run()" 
          :class="{ 'bg-blue-100': editor?.isActive('bold') }"
          class="p-2 hover:bg-gray-200 rounded font-bold text-gray-700 w-8"
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button 
          @click="editor?.chain().focus().toggleItalic().run()" 
          :class="{ 'bg-blue-100': editor?.isActive('italic') }"
          class="p-2 hover:bg-gray-200 rounded italic text-gray-700 w-8"
          title="Italic (Ctrl+I)"
        >
          I
        </button>
        <button 
          @click="editor?.chain().focus().toggleUnderline().run()" 
          :class="{ 'bg-blue-100': editor?.isActive('underline') }"
          class="p-2 hover:bg-gray-200 rounded underline text-gray-700 w-8"
          title="Underline (Ctrl+U)"
        >
          U
        </button>
        <button 
          @click="editor?.chain().focus().toggleStrike().run()" 
          :class="{ 'bg-blue-100': editor?.isActive('strike') }"
          class="p-2 hover:bg-gray-200 rounded line-through text-gray-700 w-8"
          title="Strikethrough"
        >
          S
        </button>
        <button 
          @click="editor?.chain().focus().toggleCode().run()" 
          :class="{ 'bg-blue-100': editor?.isActive('code') }"
          class="p-2 hover:bg-gray-200 rounded font-mono text-gray-700 w-8"
          title="Inline Code"
        >
          &lt;&gt;
        </button>
      </div>
      
      <div class="flex items-center gap-1 px-2 border-r border-gray-300">
        <input 
          type="color" 
          v-model="textColor"
          @change="setTextColor"
          class="w-7 h-7 rounded cursor-pointer border border-gray-300"
          title="Text Color"
        >
        <input 
          type="color" 
          v-model="bgColor"
          @change="setHighlight"
          class="w-7 h-7 rounded cursor-pointer border border-gray-300"
          title="Highlight Color"
        >
      </div>
      
      <div class="flex items-center gap-0.5 px-2 border-r border-gray-300">
        <button 
          @click="editor?.chain().focus().toggleBulletList().run()" 
          :class="{ 'bg-blue-100': editor?.isActive('bulletList') }"
          class="p-2 hover:bg-gray-200 rounded"
          title="Bullet List"
        >
          <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        <button 
          @click="editor?.chain().focus().toggleOrderedList().run()" 
          :class="{ 'bg-blue-100': editor?.isActive('orderedList') }"
          class="p-2 hover:bg-gray-200 rounded"
          title="Numbered List"
        >
          <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
          </svg>
        </button>
        <button 
          @click="editor?.chain().focus().sinkListItem('listItem').run()" 
          class="p-2 hover:bg-gray-200 rounded"
          title="Decrease Indent"
        >
          <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        <button 
          @click="editor?.chain().focus().liftListItem('listItem').run()" 
          class="p-2 hover:bg-gray-200 rounded"
          title="Increase Indent"
        >
          <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
          </svg>
        </button>
      </div>
      
      <div class="flex items-center gap-0.5 px-2 border-r border-gray-300">
        <button 
          @click="editor?.chain().focus().setTextAlign('left').run()" 
          :class="{ 'bg-blue-100': editor?.isActive({ textAlign: 'left' }) }"
          class="p-2 hover:bg-gray-200 rounded"
          title="Align Left"
        >
          <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h10M4 18h16"/>
          </svg>
        </button>
        <button 
          @click="editor?.chain().focus().setTextAlign('center').run()" 
          :class="{ 'bg-blue-100': editor?.isActive({ textAlign: 'center' }) }"
          class="p-2 hover:bg-gray-200 rounded"
          title="Align Center"
        >
          <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M7 12h10M4 18h16"/>
          </svg>
        </button>
        <button 
          @click="editor?.chain().focus().setTextAlign('right').run()" 
          :class="{ 'bg-blue-100': editor?.isActive({ textAlign: 'right' }) }"
          class="p-2 hover:bg-gray-200 rounded"
          title="Align Right"
        >
          <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M10 12h10M4 18h16"/>
          </svg>
        </button>
        <button 
          @click="editor?.chain().focus().setTextAlign('justify').run()" 
          :class="{ 'bg-blue-100': editor?.isActive({ textAlign: 'justify' }) }"
          class="p-2 hover:bg-gray-200 rounded"
          title="Justify"
        >
          <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </div>
      
      <div class="flex items-center gap-1 px-2 border-r border-gray-300">
        <button 
          @click="editor?.chain().focus().toggleBlockquote().run()" 
          :class="{ 'bg-blue-100': editor?.isActive('blockquote') }"
          class="p-2 hover:bg-gray-200 rounded"
          title="Quote"
        >
          <svg class="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z"/>
          </svg>
        </button>
        <button 
          @click="editor?.chain().focus().setHorizontalRule().run()" 
          class="p-2 hover:bg-gray-200 rounded"
          title="Horizontal Line"
        >
          <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14"/>
          </svg>
        </button>
        <button 
          @click="setLink"
          :class="{ 'bg-blue-100': editor?.isActive('link') }"
          class="p-2 hover:bg-gray-200 rounded"
          title="Insert Link"
        >
          <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
          </svg>
        </button>
      </div>
      
      <div class="flex items-center gap-1 px-2">
        <button 
          @click="editor?.chain().focus().toggleCodeBlock().run()" 
          :class="{ 'bg-blue-100': editor?.isActive('codeBlock') }"
          class="p-2 hover:bg-gray-200 rounded font-mono text-xs"
          title="Code Block"
        >
          Code
        </button>
        <button 
          @click="editor?.chain().focus().clearNodes().unsetAllMarks().run()" 
          class="p-2 hover:bg-gray-200 rounded text-xs"
          title="Clear Formatting"
        >
          Clear
        </button>
      </div>
      
      <div class="flex-1"></div>
      
      <div class="flex items-center gap-2 px-4">
        <span v-if="lastSaved" class="text-xs text-gray-500">Saved {{ lastSaved }}</span>
        <button 
          @click="handleSave"
          class="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 px-4 py-1.5 rounded font-medium text-sm transition shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
          </svg>
          Save
        </button>
      </div>
    </div>
    
    <div class="flex-1 overflow-auto bg-white p-8">
      <div class="max-w-4xl mx-auto min-h-full">
        <editor-content :editor="editor" class="min-h-[500px]" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { TextStyle, Color } from '@tiptap/extension-text-style'
import { Highlight } from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'

const props = defineProps({
  content: { type: Object, default: () => ({ html: '' }) }
})

const emit = defineEmits(['update', 'save'])
const headingLevel = ref('0')
const textColor = ref('#000000')
const bgColor = ref('#ffff00')
const lastSaved = ref('')

const editor = useEditor({
  extensions: [
    StarterKit,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Underline,
    TextStyle,
    Color,
    Highlight.configure({
      multicolor: true,
    }),
    Link.configure({
      openOnClick: false,
    }),
  ],
  content: props.content?.html || '<p></p>',
  editorProps: {
    attributes: {
      class: 'outline-none',
    },
  },
  onUpdate: ({ editor }) => {
    emitUpdate(editor.getHTML())
  },
})

watch(() => props.content, (newVal) => {
  if (newVal?.html && editor.value && editor.value.getHTML() !== newVal.html) {
    editor.value.commands.setContent(newVal.html || '<p></p>')
  }
}, { deep: true })

const setHeading = () => {
  if (!editor.value) return
  if (headingLevel.value === '0') {
    editor.value.chain().focus().setParagraph().run()
  } else {
    editor.value.chain().focus().setHeading({ level: parseInt(headingLevel.value) }).run()
  }
}

const setTextColor = () => {
  editor.value?.chain().focus().setColor(textColor.value).run()
}

const setHighlight = () => {
  editor.value?.chain().focus().setHighlight({ color: bgColor.value }).run()
}

const setLink = () => {
  const previousUrl = editor.value?.getAttributes('link').href
  const url = window.prompt('Enter URL:', previousUrl || 'https://')
  
  if (url === null) return
  
  if (url === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  
  editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

const emitUpdate = (html) => {
  emit('update', { html })
}

const handleSave = () => {
  const now = new Date()
  lastSaved.value = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
  emit('save')
}

onMounted(() => {
  if (props.content?.html) {
    editor.value?.commands.setContent(props.content.html)
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style>
.ProseMirror {
  outline: none;
  color: #1a1a1a;
  font-size: 16px;
  line-height: 1.6;
}

.ProseMirror p {
  margin: 0 0 1em 0;
}

.ProseMirror h1 {
  font-size: 2.5em;
  font-weight: 700;
  margin: 0 0 0.5em 0;
  color: #000;
}

.ProseMirror h2 {
  font-size: 2em;
  font-weight: 600;
  margin: 0 0 0.5em 0;
  color: #000;
}

.ProseMirror h3 {
  font-size: 1.75em;
  font-weight: 600;
  margin: 0 0 0.5em 0;
  color: #000;
}

.ProseMirror h4 {
  font-size: 1.5em;
  font-weight: 600;
  margin: 0 0 0.5em 0;
  color: #000;
}

.ProseMirror h5 {
  font-size: 1.25em;
  font-weight: 600;
  margin: 0 0 0.5em 0;
  color: #000;
}

.ProseMirror h6 {
  font-size: 1.1em;
  font-weight: 600;
  margin: 0 0 0.5em 0;
  color: #000;
}

.ProseMirror ul, .ProseMirror ol {
  padding-left: 1.5em;
  margin: 0 0 1em 0;
}

.ProseMirror ul li {
  list-style-type: disc;
}

.ProseMirror ol li {
  list-style-type: decimal;
}

.ProseMirror blockquote {
  border-left: 4px solid #3b82f6;
  padding-left: 1em;
  margin: 1em 0;
  color: #4b5563;
  font-style: italic;
}

.ProseMirror code {
  background: #f3f4f6;
  border-radius: 4px;
  padding: 0.2em 0.4em;
  font-family: monospace;
  font-size: 0.9em;
  color: #e11d48;
}

.ProseMirror pre {
  background: #1f2937;
  color: #f9fafb;
  border-radius: 8px;
  padding: 1em;
  margin: 1em 0;
  overflow-x: auto;
}

.ProseMirror pre code {
  background: none;
  color: inherit;
  padding: 0;
}

.ProseMirror hr {
  border: none;
  border-top: 2px solid #e5e7eb;
  margin: 2em 0;
}

.ProseMirror a {
  color: #3b82f6;
  text-decoration: underline;
  cursor: pointer;
}

.ProseMirror mark {
  background-color: #ffff00;
  padding: 0.1em 0;
}

.ProseMirror img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1em 0;
}

.ProseMirror .is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #9ca3af;
  pointer-events: none;
  height: 0;
}
</style>
