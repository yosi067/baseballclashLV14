<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import CharacterList from './components/CharacterList.vue'
import CharacterDetail from './components/CharacterDetail.vue'
import { useCharacters } from './composables/useCharacters'

const { characters, loading, error, fetchCharacters } = useCharacters()
const selectedCharacter = ref(null)
const windowWidth = ref(window.innerWidth)

const isMobile = computed(() => windowWidth.value < 900)

const handleResize = () => {
  windowWidth.value = window.innerWidth
}

const handleSelect = (character) => {
  selectedCharacter.value = character
}

const handleBack = () => {
  selectedCharacter.value = null
}

// Select first character by default when data loads (only on desktop)
onMounted(async () => {
  window.addEventListener('resize', handleResize)
  await fetchCharacters()
  if (!isMobile.value && characters.value.length > 0) {
    selectedCharacter.value = characters.value[0]
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="app-container">
    <div class="background-glow"></div>
    
    <main class="main-layout">
      <div v-if="loading" class="loading-screen">
        <div class="loader"></div>
        <p>載入球員名單中...</p>
      </div>

      <div v-else-if="error" class="error-screen">
        <p>載入資料錯誤: {{ error }}</p>
        <button @click="fetchCharacters" class="btn-primary">重試</button>
      </div>

      <template v-else>
        <!-- Desktop Layout -->
        <template v-if="!isMobile">
          <div class="left-panel">
            <CharacterDetail :character="selectedCharacter" />
          </div>
          
          <div class="right-panel">
            <CharacterList 
              :characters="characters" 
              :selected-id="selectedCharacter?.Id"
              @select="handleSelect"
            />
          </div>
        </template>

        <!-- Mobile Layout -->
        <template v-else>
          <div v-if="selectedCharacter" class="mobile-panel full-height">
            <CharacterDetail 
              :character="selectedCharacter" 
              :show-back-button="true"
              @back="handleBack"
            />
          </div>
          <div v-else class="mobile-panel full-height">
            <CharacterList 
              :characters="characters" 
              :selected-id="selectedCharacter?.Id"
              @select="handleSelect"
            />
          </div>
        </template>
      </template>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  height: 100vh; /* Fallback */
  height: 100dvh;
  width: 100vw;
  position: relative;
  overflow: hidden;
}

.background-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    /* Stadium Lights Glow */
    radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.4) 0%, transparent 40%),
    radial-gradient(circle at 80% 20%, rgba(56, 189, 248, 0.4) 0%, transparent 40%),
    /* Grass Texture (Stripes) */
    repeating-linear-gradient(
      0deg,
      rgba(22, 101, 52, 0.8) 0px,
      rgba(22, 101, 52, 0.8) 40px,
      rgba(20, 83, 45, 0.8) 40px,
      rgba(20, 83, 45, 0.8) 80px
    ),
    /* Dirt Diamond Hint (Bottom Center) */
    radial-gradient(circle at 50% 120%, rgba(120, 53, 15, 0.6) 0%, transparent 60%),
    /* Dark Overlay for Text Readability */
    linear-gradient(to bottom, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.6) 100%);
  background-blend-mode: screen, screen, normal, normal, multiply;
  background-color: #0f172a;
  z-index: -1;
  pointer-events: none;
}

.main-layout {
  display: flex;
  height: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
  gap: 20px;
  box-sizing: border-box;
}

.left-panel {
  flex: 2;
  min-width: 0; /* Prevent flex overflow */
  height: 100%;
  overflow: hidden;
}

.right-panel {
  flex: 1;
  min-width: 300px;
  max-width: 400px;
  height: 100%;
  overflow: hidden;
}

.mobile-panel {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.loading-screen, .error-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.loader {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(56, 189, 248, 0.3);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 900px) {
  .main-layout {
    padding: 0; /* Full width on mobile */
  }
  
  .app-container {
    /* Ensure mobile browsers handle height correctly */
    height: 100dvh;
  }
}
</style>
