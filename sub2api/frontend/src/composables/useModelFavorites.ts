/**
 * useModelFavorites —— 模型收藏（纯前端，localStorage 持久化，按模型名去重）。
 *
 * 阶段 3（PRD §7.2「允许收藏模型」）：后端无收藏字段，收藏状态保存在本浏览器。
 * 模块级共享 ref，使定价表里的星标与「只看收藏」筛选实时联动。
 * 所有 localStorage 访问都 try/catch：隐私模式/禁用存储时降级为内存态，不抛错。
 */
import { computed, ref } from 'vue'

const STORAGE_KEY = 'sub2api_model_favorites'

function loadFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

// 模块级单例：所有组件共享同一份收藏集合。
const favorites = ref<Set<string>>(new Set(loadFromStorage()))

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites.value]))
  } catch {
    /* 存储不可用时静默降级，保留内存态 */
  }
}

export function useModelFavorites() {
  const isFavorite = (name: string): boolean => favorites.value.has(name)

  const toggleFavorite = (name: string): void => {
    if (!name) return
    const next = new Set(favorites.value)
    if (next.has(name)) {
      next.delete(name)
    } else {
      next.add(name)
    }
    favorites.value = next
    persist()
  }

  const favoriteCount = computed(() => favorites.value.size)
  const hasFavorites = computed(() => favorites.value.size > 0)

  return { favorites, isFavorite, toggleFavorite, favoriteCount, hasFavorites }
}
