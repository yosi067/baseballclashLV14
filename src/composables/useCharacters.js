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
      const response = await fetch(import.meta.env.BASE_URL + 'baseball crash LV14 - BCLV14.csv')
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
      // Note: The Pitcher section has empty headers for Skill and Intro in the CSV file.
      // We need to handle this. PapaParse might key them as empty strings or similar.
      // Alternatively, we can use the fact that Batters and Pitchers share names.
      const pitchers = Papa.parse(pitcherLines.join('\n'), {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      }).data
      
      // Create a map of Batters for quick lookup of shared info (Skill, Intro)
      const batterMap = new Map()
      batters.forEach(b => {
        if (b['球員名稱']) {
          batterMap.set(b['球員名稱'], {
            Skill: b['技能'],
            Introduction: b['角色介紹']
          })
        }
      })
      
      // Process and Merge
      // We want a unified structure but preserving specific stats
      
      const processed = []
      
      // Helper to create a character object
      const createChar = (row, type) => {
        let skill = row['技能'] || ''
        let intro = row['角色介紹'] || ''
        
        // If Pitcher and missing info, try to look up from Batter map
        // (Pitchers often share identity with Batters/Pitcher(Batting))
        if (type === 'Pitcher' && (!skill || !intro)) {
          const batterInfo = batterMap.get(row['球員名稱'])
          if (batterInfo) {
            if (!skill) skill = batterInfo.Skill
            if (!intro) intro = batterInfo.Introduction
          }
          
          // If still missing, try to read from "empty" keys if PapaParse captured them
          // The CSV structure for Pitchers seems to have Skill at index 8 and Intro at index 10
          // But with header:true, we rely on keys.
          // Let's check if there are keys like "__parsed_extra" or similar, but lookup is safer.
        }

        // Common fields
        const char = {
          JerseyNumber: row['背號'],
          Name: row['球員名稱'],
          Position: row['位置'],
          Level: row['卡片等級'],
          Average: row['能力總和平均'],
          Type: type,
          Stats: [],
          Skill: skill || '',
          Introduction: intro || ''
        }
        
        // Flatten stats for easier sorting
        if (type === 'Batter') {
          char['擊球'] = row['擊球']
          char['力量'] = row['力量']
          char['跑速'] = row['跑速']
          char['傳球'] = row['傳球']
          char['防守'] = row['防守']
          
          char.Stats = [
            { label: '擊球', value: row['擊球'], color: '#38bdf8' }, // Blue
            { label: '力量', value: row['力量'], color: '#ef4444' }, // Red
            { label: '跑速', value: row['跑速'], color: '#22c55e' }, // Green
            { label: '傳球', value: row['傳球'], color: '#f59e0b' }, // Orange
            { label: '防守', value: row['防守'], color: '#8b5cf6' }, // Purple
          ]
        } else if (type === 'Pitcher') {
          char['控球'] = row['控球']
          char['球速'] = row['球速']
          char['移動'] = row['移動']
          char['旋轉'] = row['旋轉']
          
          char.Stats = [
            { label: '控球', value: row['控球'], color: '#38bdf8' },
            { label: '球速', value: row['球速'], color: '#ef4444' },
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
      
      characters.value = processed.sort((a, b) => {
        return (Number(b.JerseyNumber) || 0) - (Number(a.JerseyNumber) || 0)
      })
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
