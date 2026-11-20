import { describe, it, expect } from 'vitest'
import {
  toMdName,
  formatSize,
  parseDelimited,
  csvToMarkdown,
  jsonToMarkdown,
} from '../converter'

describe('toMdName', () => {
  it('把扩展名替换为 .md', () => {
    expect(toMdName('a.txt')).toBe('a.md')
    expect(toMdName('note.tar.gz')).toBe('note.tar.md')
    expect(toMdName('dir/a.ts')).toBe('dir/a.md')
  })

  it('无扩展名直接补 .md', () => {
    expect(toMdName('README')).toBe('README.md')
    expect(toMdName('a')).toBe('a.md')
  })
})

describe('formatSize', () => {
  it('按 B / KB / MB 分档并保留精度', () => {
    expect(formatSize(0)).toBe('0 B')
    expect(formatSize(512)).toBe('512 B')
    expect(formatSize(1024)).toBe('1.0 KB')
    expect(formatSize(1536)).toBe('1.5 KB')
    expect(formatSize(1024 * 1024)).toBe('1.00 MB')
  })
})

describe('parseDelimited', () => {
  it('解析简单 CSV 为二维数组', () => {
    expect(parseDelimited('a,b\n1,2')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ])
  })

  it('正确处理引号包裹的字段内含逗号', () => {
    expect(parseDelimited('a,"b,c"')).toEqual([['a', 'b,c']])
  })

  it('正确处理转义引号 ""', () => {
    expect(parseDelimited('"a""b"')).toEqual([['a"b']])
  })

  it('剥离 BOM 并兼容 CRLF 换行', () => {
    expect(parseDelimited('\uFEFFa,b\r\n1,2')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ])
  })

  it('忽略空行', () => {
    expect(parseDelimited('a,b\n\n1,2\n')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ])
  })

  it('支持自定义分隔符（制表符）', () => {
    expect(parseDelimited('a\tb', '\t')).toEqual([['a', 'b']])
  })
})

describe('csvToMarkdown', () => {
  it('生成标准 Markdown 表格', () => {
    expect(csvToMarkdown('a,b\n1,2')).toBe('| a | b |\n| --- | --- |\n| 1 | 2 |')
  })

  it('空输入给出占位文案', () => {
    expect(csvToMarkdown('')).toBe('_（表格为空）_')
  })

  it('转义单元格内的竖线', () => {
    expect(csvToMarkdown('a,b\nx|y,z')).toContain('x\\|y')
  })

  it('列数不齐时补齐空单元格', () => {
    const md = csvToMarkdown('a,b,c\n1,2')
    expect(md.split('\n')[2]).toBe('| 1 | 2 |  |')
  })
})

describe('jsonToMarkdown', () => {
  it('格式化 JSON 并包成 json 代码块', () => {
    const md = jsonToMarkdown('{"a":1}')
    expect(md).toContain('```json')
    expect(md).toContain('"a": 1')
    expect(md.trim().endsWith('```')).toBe(true)
  })

  it('无效 JSON 原样保留而不抛错', () => {
    const md = jsonToMarkdown('not json {')
    expect(md).toContain('not json {')
    expect(md).toContain('```json')
  })

  it('JSONL 按行逐条格式化', () => {
    const md = jsonToMarkdown('{"a":1}\n{"b":2}', true)
    expect(md).toContain('"a": 1')
    expect(md).toContain('"b": 2')
  })
})
