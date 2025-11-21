import { ref, onMounted } from 'vue'
import Papa from 'papaparse'

const characters = ref([])
const loading = ref(true)
const error = ref(null)

export function useCharacters() {
  const fetchCharacters = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('/baseballclashcheck - BCLV14.csv')
      if (!response.ok) throw new Error('Failed to fetch CSV file')
      const csvText = await response.text()
      
      // The CSV has two sections separated by empty lines.
      // We need to find where the second header starts.
      // First header is at line 1: 位置,球員名稱...
      // Second header is at line 110: 位置,球員名稱...
      
      // Split by lines to find the break
      const lines = csvText.split(/\r?\n/)
      
      const batterLines = []
      const pitcherLines = []
      let isPitcherSection = false
      
      // Headers for manual parsing if needed, or just push lines to separate arrays
      // We'll reconstruct two CSV strings and parse them separately
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue // Skip empty lines
        
        // Check if this is the second header
        if (i > 0 && line.startsWith('位置,球員名稱') && line.includes('控球')) {
          isPitcherSection = true
          pitcherLines.push(line)
          continue
        }
        
        if (isPitcherSection) {
          pitcherLines.push(line)
        } else {
          batterLines.push(line)
        }
      }
      
      // Parse Batters
      const batters = Papa.parse(batterLines.join('\n'), {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      }).data
      
      // Parse Pitchers
      const pitchers = Papa.parse(pitcherLines.join('\n'), {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      }).data
      
      // Process and Merge
      // We want a unified structure but preserving specific stats
      
      const processed = []
      
      // Helper to create a character object
      const createChar = (row, type) => {
        // Common fields
        const char = {
          Name: row['球員名稱'],
          Position: row['位置'],
          Level: row['卡片等級'],
          Average: row['能力總和平均'],
          Type: type,
          Stats: [],
          Skill: row['技能說明'] || ''
        }
        
        // Flatten stats for easier sorting
        if (type === 'Batter') {
          char['擊球'] = row['擊球']
          char['力量'] = row['力量']
          char['速度'] = row['速度']
          char['傳球'] = row['傳球']
          char['防守'] = row['防守']
          
          char.Stats = [
            { label: '擊球', value: row['擊球'], color: '#38bdf8' }, // Blue
            { label: '力量', value: row['力量'], color: '#ef4444' }, // Red
            { label: '速度', value: row['速度'], color: '#22c55e' }, // Green
            { label: '傳球', value: row['傳球'], color: '#f59e0b' }, // Orange
            { label: '防守', value: row['防守'], color: '#8b5cf6' }, // Purple
          ]
        } else if (type === 'Pitcher') {
          char['控球'] = row['控球']
          char['速度'] = row['速度'] // Note: Same key '速度' as batter, but means Velocity
          char['移動'] = row['移動']
          char['旋轉'] = row['旋轉']
          
          char.Stats = [
            { label: '控球', value: row['控球'], color: '#38bdf8' },
            { label: '速度', value: row['速度'], color: '#ef4444' },
            { label: '移動', value: row['移動'], color: '#22c55e' },
            { label: '旋轉', value: row['旋轉'], color: '#f59e0b' },
          ]
        }
        
        return char
      }
      
      // Add Batters
      batters.forEach(b => {
        if (b['球員名稱']) {
          processed.push(createChar(b, 'Batter'))
        }
      })
      
      // Add Pitchers
      // Note: Some pitchers might be in the batter list as "投手(打)"
      // We should probably prioritize the Pitcher stats for them, or show them as separate entries?
      // The user asked to "rearrange according to fields".
      // Let's add them as separate entries for now if they are distinct rows in CSV.
      // But wait, "投手(打)" rows in batter section have batter stats.
      // "投手" rows in pitcher section have pitcher stats.
      // I will add them all. The user can filter by position.
      
      pitchers.forEach(p => {
        if (p['球員名稱']) {
          processed.push(createChar(p, 'Pitcher'))
        }
      })
      
      characters.value = processed
      loading.value = false
      
    } catch (e) {
      console.error(e)
      error.value = e.message
      loading.value = false
    }
  }

  onMounted(() => {
    if (characters.value.length === 0) {
      fetchCharacters()
    }
  })

  return {
    characters,
    loading,
    error,
    fetchCharacters
  }
}
