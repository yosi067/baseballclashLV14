<script setup>
import { computed, ref } from 'vue'
import { Zap, Shield, Activity, Target, Wind, RotateCw, Move, ArrowLeft } from 'lucide-vue-next'

const props = defineProps({
  character: {
    type: Object,
    default: null
  },
  showBackButton: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['back'])

// Map labels to icons
const getIcon = (label) => {
  switch (label) {
    case '擊球': return Target
    case '力量': return Zap
    case '跑速': return Wind // Run Speed
    case '球速': return Zap // Velocity (using Zap for power/speed)
    case '傳球': return Activity
    case '防守': return Shield
    case '控球': return Target
    case '移動': return Move
    case '旋轉': return RotateCw
    default: return Activity
  }
}

const getAvatarUrl = (name) => {
  return `./images/characters/${name}.jpeg`
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
  e.target.nextElementSibling.style.display = 'flex'
}

const formatSkill = (skill) => {
  if (!skill) return ''
  // Replace [text] with <span class="highlight">[text]</span>
  return skill.replace(/\[(.*?)\]/g, '<span class="highlight">[$1]</span>')
}

const swipeStartX = ref(0)
const swipeStartY = ref(0)
const swipeOffset = ref(0)
const isTrackingSwipe = ref(false)
const isSwipeActive = ref(false)

const swipeStyle = computed(() => {
  if (!props.showBackButton) return {}

  const progress = Math.min(swipeOffset.value / 120, 1)
  return {
    transform: `translateX(${swipeOffset.value}px)`,
    opacity: `${1 - progress * 0.25}`,
    transition: isSwipeActive.value ? 'none' : 'transform 0.22s ease, opacity 0.22s ease'
  }
})

const resetSwipe = () => {
  swipeOffset.value = 0
  isTrackingSwipe.value = false
  isSwipeActive.value = false
}

const handleTouchStart = (event) => {
  if (!props.showBackButton || event.touches.length !== 1) return

  swipeStartX.value = event.touches[0].clientX
  swipeStartY.value = event.touches[0].clientY
  swipeOffset.value = 0
  isTrackingSwipe.value = true
  isSwipeActive.value = false
}

const handleTouchMove = (event) => {
  if (!isTrackingSwipe.value || event.touches.length !== 1) return

  const deltaX = event.touches[0].clientX - swipeStartX.value
  const deltaY = event.touches[0].clientY - swipeStartY.value
  const absX = Math.abs(deltaX)
  const absY = Math.abs(deltaY)

  if (deltaX <= 0) {
    swipeOffset.value = 0
    return
  }

  if (!isSwipeActive.value) {
    if (absX < 12) return
    if (absX <= absY * 1.2) {
      resetSwipe()
      return
    }
    isSwipeActive.value = true
  }

  event.preventDefault()
  swipeOffset.value = Math.min(deltaX, 160)
}

const handleTouchEnd = () => {
  if (!isTrackingSwipe.value) return

  if (swipeOffset.value >= 90) {
    emit('back')
  }

  resetSwipe()
}

const maxStat = 255
</script>

<template>
  <div 
    class="character-detail glass-panel"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @touchcancel="resetSwipe"
  >
    <div v-if="character" class="detail-content" :style="swipeStyle">
      <div class="detail-header">
        <button v-if="showBackButton" @click="emit('back')" class="back-btn">
          <ArrowLeft :size="24" />
        </button>
        
        <div class="avatar-wrapper">
          <div class="avatar-large">
            <img 
              :src="getAvatarUrl(character.Name)" 
              alt="" 
              class="avatar-img"
              @error="handleImageError"
            />
            <!-- Placeholder for actual image -->
            <div class="avatar-initial">{{ character.Name ? character.Name.charAt(0) : '?' }}</div>
          </div>
          <div class="position-badge">{{ character.Position }}</div>
        </div>
        
        <div class="header-info">
          <h1 class="name">{{ character.Name }}</h1>
          <div class="badges">
            <span class="badge jersey">背號 #{{ character.JerseyNumber }}</span>
            <span class="badge level">{{ character.Level }}</span>
            <span class="badge avg">總和 {{ character.Average }}</span>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <div v-for="stat in character.Stats" :key="stat.label" class="stat-card">
          <div class="stat-header">
            <component :is="getIcon(stat.label)" :size="18" :style="{ color: stat.color }" />
            <span class="stat-label">{{ stat.label }}</span>
            <span class="stat-value">{{ stat.value }}</span>
          </div>
          <div class="stat-bar-bg">
            <div 
              class="stat-bar-fill" 
              :style="{ width: `${(stat.value / maxStat) * 100}%`, backgroundColor: stat.color }"
            ></div>
          </div>
        </div>
      </div>

      <div class="info-section">
        <div v-if="character.Skill" class="skill-section">
          <h3 class="section-title">特殊技能</h3>
          <div class="skill-card">
            <div class="skill-icon-wrapper">
              <Zap :size="24" class="skill-icon" />
            </div>
            <div class="skill-text">
              <p v-html="formatSkill(character.Skill)"></p>
            </div>
          </div>
        </div>

        <div v-if="character.Introduction" class="intro-section">
          <h3 class="section-title">角色介紹</h3>
          <div class="intro-card">
            <p>{{ character.Introduction }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-content">
        <Target :size="64" class="empty-icon" />
        <h2>選擇球員</h2>
        <p>從名單中選擇一位球員以查看詳細數據和能力。</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.character-detail {
  height: 100%;
  overflow-y: auto;
  padding: 30px;
  box-sizing: border-box;
  position: relative;
  overscroll-behavior-x: contain;
  touch-action: pan-y;
}

.detail-content {
  max-width: 800px;
  margin: 0 auto;
  animation: fadeIn 0.3s ease;
  padding-bottom: 40px;
  will-change: transform, opacity;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 40px;
  position: relative;
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-right: -10px; /* Pull it closer */
  transition: all 0.2s;
}

.back-btn:hover {
  background: rgba(56, 189, 248, 0.2);
  color: var(--accent-color);
}

.avatar-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
}

.avatar-large {
  width: 100%;
  height: 100%;
  border-radius: 24px;
  background: linear-gradient(135deg, #334155, #1e293b);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border: 2px solid var(--glass-border);
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

.avatar-initial {
  font-size: 3rem;
  font-weight: 800;
  color: var(--text-secondary);
  z-index: 0;
  display: none; /* Hidden by default, shown on error */
}

/* Show initial when image fails (handled by JS setting display:none on img) */
.avatar-img[style*="display: none"] + .avatar-initial {
  display: block;
}

.position-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: var(--accent-color);
  color: #0f172a;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.9rem;
  box-shadow: 0 4px 10px rgba(56, 189, 248, 0.4);
  z-index: 10;
}

.name {
  margin: 0 0 12px 0;
  font-size: 2.5rem;
  background: linear-gradient(to right, #fff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.badges {
  display: flex;
  gap: 12px;
}

.badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.badge.level {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.badge.jersey {
  background: rgba(56, 189, 248, 0.18);
  color: var(--accent-color);
  border: 1px solid rgba(56, 189, 248, 0.35);
}

.badge.avg {
  background: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.03);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.stat-label {
  flex: 1;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.stat-value {
  font-weight: 700;
  font-size: 1.1rem;
}

.stat-bar-bg {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-title {
  font-size: 1.2rem;
  margin-bottom: 16px;
  color: var(--text-primary);
  border-left: 4px solid var(--accent-color);
  padding-left: 12px;
}

.skill-card {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(30, 41, 59, 0.4));
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.skill-icon-wrapper {
  background: rgba(56, 189, 248, 0.2);
  padding: 12px;
  border-radius: 12px;
  color: var(--accent-color);
  flex-shrink: 0;
}

.skill-text p {
  margin: 0;
  line-height: 1.6;
  color: var(--text-secondary);
}

/* Highlight style for [Skill Name] */
:deep(.highlight) {
  color: #fbbf24;
  font-weight: 700;
}

.intro-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 24px;
}

.intro-card p {
  margin: 0;
  line-height: 1.8;
  color: var(--text-secondary);
}

.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--text-secondary);
}

.empty-icon {
  margin-bottom: 20px;
  opacity: 0.2;
}

.empty-content h2 {
  margin: 0 0 8px 0;
  color: var(--text-primary);
}
</style>
