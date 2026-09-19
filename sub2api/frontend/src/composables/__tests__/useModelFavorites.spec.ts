import { describe, it, expect } from 'vitest'
import { useModelFavorites } from '../useModelFavorites'

// 说明：useModelFavorites 是模块级单例，测试用「先归零再翻转」的方式保证与执行顺序无关。
describe('useModelFavorites', () => {
  it('toggleFavorite 在收藏与未收藏之间切换', () => {
    const { isFavorite, toggleFavorite } = useModelFavorites()
    const name = 'unit-test-model-a'
    const initial = isFavorite(name)
    toggleFavorite(name)
    expect(isFavorite(name)).toBe(!initial)
    toggleFavorite(name)
    expect(isFavorite(name)).toBe(initial)
  })

  it('收藏后写入 localStorage', () => {
    const { isFavorite, toggleFavorite } = useModelFavorites()
    const name = 'unit-test-model-b'
    if (isFavorite(name)) toggleFavorite(name)
    toggleFavorite(name)
    expect(localStorage.getItem('sub2api_model_favorites')).toContain(name)
    toggleFavorite(name) // 清理
  })

  it('favoriteCount 反映收藏数量', () => {
    const { isFavorite, toggleFavorite, favoriteCount } = useModelFavorites()
    const name = 'unit-test-model-c'
    if (isFavorite(name)) toggleFavorite(name)
    const before = favoriteCount.value
    toggleFavorite(name)
    expect(favoriteCount.value).toBe(before + 1)
    toggleFavorite(name)
    expect(favoriteCount.value).toBe(before)
  })

  it('空名称不产生收藏', () => {
    const { toggleFavorite, favoriteCount } = useModelFavorites()
    const before = favoriteCount.value
    toggleFavorite('')
    expect(favoriteCount.value).toBe(before)
  })
})
