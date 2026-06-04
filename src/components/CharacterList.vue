<script setup>
import { ref, computed } from 'vue'
import { Search, ArrowUpDown, Filter, Check } from 'lucide-vue-next'

const props = defineProps({
  characters: {
    type: Array,
    required: true
  },
  selectedId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['select'])

const searchQuery = ref('')
const sortField = ref('Average')
const sortDirection = ref('desc')
const showFilters = ref(false)

// Filter States
const selectedGrades = ref(['金卡', '紫卡', '藍卡', '白卡'])
const selectedPositions = ref(['外野手', '內野手', '捕手', '投手', '投手(打)'])

const gradeOptions = ['金卡', '紫卡', '藍卡', '白卡']
const positionOptions = ['外野手', '內野手', '捕手', '投手', '投手(打)']

// Sort options with Chinese labels and corresponding keys
const sortOptions = [
  { label: '擊球', key: '擊球' },
  { label: '力量', key: '力量' },
  { label: '跑速', key: '跑速' },
  { label: '球速', key: '球速' },
  { label: '傳球', key: '傳球' },
  { label: '防守', key: '防守' },
  { label: '控球', key: '控球' },
  { label: '移動', key: '移動' },
  { label: '旋轉', key: '旋轉' },
]

const filteredCharacters = computed(() => {
  let result = [...props.characters]

  // Filter by Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(c => 
      (c.Name && c.Name.toLowerCase().includes(query)) || 
      (c.Position && c.Position.toLowerCase().includes(query))
    )
  }

  // Filter by Grade
  result = result.filter(c => selectedGrades.value.includes(c.Level))

  // Filter by Position
  result = result.filter(c => selectedPositions.value.includes(c.Position))

  // Sort
  result.sort((a, b) => {
    // Handle missing values (e.g. sorting by Pitching stat for a Batter)
    const valA = Number(a[sortField.value]) || -1
    const valB = Number(b[sortField.value]) || -1
    
    if (valA < valB) return sortDirection.value === 'asc' ? -1 : 1
    if (valA > valB) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })

  return result
})

const toggleSort = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'desc'
  }
}

const toggleFilter = (list, item) => {
  const index = list.indexOf(item)
  if (index > -1) {
    list.splice(index, 1)
  } else {
    list.push(item)
  }
}

const getAvatarUrl = (name) => {
  return `./images/characters/${name}.jpeg`
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
  e.target.nextElementSibling.style.display = 'flex'
}

const getSortLabel = (key) => {
  const option = sortOptions.find(o => o.key === key)
  return option ? option.label : key
}
</script>

<template>
  <div class="character-list glass-panel">
    <div class="list-header">
      <div class="header-top">
        <h2 class="text-accent">球員名單</h2>
        <button @click="showFilters = !showFilters" class="btn-icon" :class="{ active: showFilters }">
          <Filter :size="20" />
        </button>
      </div>
      
      <div class="search-bar">
        <Search class="search-icon" :size="18" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜尋名稱或位置..." 
          class="input-field"
        />
      </div>

      <div v-if="showFilters" class="filters-panel">
        <div class="filter-group">
          <span class="filter-label">卡片等級:</span>
          <div class="filter-options">
            <button 
              v-for="grade in gradeOptions" 
              :key="grade"
              @click="toggleFilter(selectedGrades, grade)"
              class="filter-chip"
              :class="{ active: selectedGrades.includes(grade) }"
            >
              <div class="checkbox">
                <Check v-if="selectedGrades.includes(grade)" :size="12" />
              </div>
              {{ grade }}
            </button>
          </div>
        </div>
        <div class="filter-group">
          <span class="filter-label">位置:</span>
          <div class="filter-options">
            <button 
              v-for="pos in positionOptions" 
              :key="pos"
              @click="toggleFilter(selectedPositions, pos)"
              class="filter-chip"
              :class="{ active: selectedPositions.includes(pos) }"
            >
              <div class="checkbox">
                <Check v-if="selectedPositions.includes(pos)" :size="12" />
              </div>
              {{ pos }}
            </button>
          </div>
        </div>
      </div>
      
      <div class="sort-controls">
        <span class="sort-label">排序依據:</span>
        <div class="sort-chips">
          <button 
            v-for="option in sortOptions" 
            :key="option.key"
            @click="toggleSort(option.key)"
            class="sort-chip"
            :class="{ active: sortField === option.key }"
          >
            {{ option.label }}
            <ArrowUpDown v-if="sortField === option.key" :size="12" class="sort-arrow" :class="{ rotated: sortDirection === 'asc' }" />
          </button>
        </div>
      </div>
    </div>

    <div class="list-content">
      <div 
        v-for="char in filteredCharacters" 
        :key="char.Name + char.Position"
        class="character-item"
        :class="{ active: selectedId === char.Name }"
        @click="emit('select', char)"
      >
        <div class="char-avatar-container">
          <img 
            :src="getAvatarUrl(char.Name)" 
            alt="" 
            class="char-avatar-img"
            @error="handleImageError"
          />
          <div class="char-avatar-placeholder" :class="{ 'pitcher-batting': char.Position === '投手(打)' }">
            {{ char.Position ? char.Position.substring(0, 2) : '?' }}
          </div>
        </div>
        <div class="char-info">
          <div class="char-name">
            {{ char.Name }}
            <span v-if="char.Position === '投手(打)'" class="batting-indicator">打擊</span>
          </div>
          <div class="char-stats-mini">
            <span class="stat-pill">總和 {{ char.Average }}</span>
            <span v-if="sortField !== 'Average'" class="stat-pill sort-stat">
              {{ getSortLabel(sortField) }} {{ char[sortField] || '-' }}
            </span>
            <span class="stat-pill level">{{ char.Level }}</span>
          </div>
        </div>
      </div>
      
      <div v-if="filteredCharacters.length === 0" class="no-results">
        沒有找到球員
      </div>
    </div>
  </div>
</template>

<style scoped>
.character-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.list-header {
  padding: 20px;
  border-bottom: 1px solid var(--glass-border);
  flex-shrink: 0;
  background: rgba(15, 23, 42, 0.4);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.list-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.btn-icon {
  background: transparent;
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover, .btn-icon.active {
  background: rgba(56, 189, 248, 0.2);
  color: var(--accent-color);
  border-color: var(--accent-color);
}

.search-bar {
  position: relative;
  margin-bottom: 16px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.search-bar input {
  padding-left: 40px;
}

.filters-panel {
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.filter-group {
  margin-bottom: 12px;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-chip {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-chip.active {
  background: rgba(56, 189, 248, 0.15);
  color: var(--accent-color);
  font-weight: 600;
  border-color: var(--accent-color);
}

.checkbox {
  width: 14px;
  height: 14px;
  border: 1px solid var(--text-secondary);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.filter-chip.active .checkbox {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: #0f172a;
}

.sort-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sort-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.sort-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sort-chip {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.sort-chip:hover {
  background: rgba(255, 255, 255, 0.1);
}

.sort-chip.active {
  background: rgba(56, 189, 248, 0.2);
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.sort-arrow {
  transition: transform 0.2s;
}

.sort-arrow.rotated {
  transform: rotate(180deg);
}

.list-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.character-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.character-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.character-item.active {
  background: linear-gradient(90deg, rgba(56, 189, 248, 0.1), transparent);
  border-left: 3px solid var(--accent-color);
}

.char-avatar-container {
  width: 40px;
  height: 40px;
  margin-right: 12px;
  position: relative;
}

.char-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--glass-border);
}

.char-avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: var(--accent-color);
  border: 1px solid var(--glass-border);
  font-size: 0.8rem;
  position: absolute;
  top: 0;
  left: 0;
}

.char-avatar-placeholder.pitcher-batting {
  border-color: #fbbf24;
  color: #fbbf24;
}

.char-info {
  flex: 1;
}

.char-name {
  font-weight: 600;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.batting-indicator {
  font-size: 0.7rem;
  background: #fbbf24;
  color: #0f172a;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
}

.char-stats-mini {
  display: flex;
  gap: 8px;
  align-items: center;
}

.stat-pill {
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
}

.stat-pill.sort-stat {
  background: rgba(56, 189, 248, 0.1);
  color: var(--accent-color);
  border: 1px solid rgba(56, 189, 248, 0.2);
}

.stat-pill.level {
  color: #fbbf24; /* Amber for level */
}

.no-results {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}
</style>
