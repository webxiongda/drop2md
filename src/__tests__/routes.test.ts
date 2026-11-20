import { describe, it, expect } from 'vitest'
import { pageFromHash } from '../types'

describe('pageFromHash', () => {
  it('识别全部合法页面', () => {
    expect(pageFromHash('#/convert')).toBe('convert')
    expect(pageFromHash('#/formats')).toBe('formats')
    expect(pageFromHash('#settings')).toBe('settings')
  })

  it('容错查询串与尾部斜杠', () => {
    expect(pageFromHash('#/history?x=1')).toBe('history')
    expect(pageFromHash('#/preview/')).toBe('preview')
  })

  it('未知或空值回落到工作台', () => {
    expect(pageFromHash('')).toBe('convert')
    expect(pageFromHash('#/nope')).toBe('convert')
  })
})
