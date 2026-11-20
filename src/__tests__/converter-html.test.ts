// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { htmlToMarkdown } from '../converter'

describe('htmlToMarkdown（jsdom 环境）', () => {
  it('标题转为 # 语法', () => {
    expect(htmlToMarkdown('<h1>Title</h1>')).toBe('# Title')
    expect(htmlToMarkdown('<h3>Sub</h3>')).toBe('### Sub')
  })

  it('段落转为纯文本', () => {
    expect(htmlToMarkdown('<p>Hello world</p>')).toBe('Hello world')
  })

  it('粗体与链接转成 Markdown 标记', () => {
    expect(htmlToMarkdown('<p><strong>bold</strong></p>')).toBe('**bold**')
    expect(htmlToMarkdown('<p><a href="https://x.com">link</a></p>')).toBe('[link](https://x.com)')
  })

  it('无序列表与有序列表', () => {
    expect(htmlToMarkdown('<ul><li>a</li><li>b</li></ul>')).toBe('- a\n- b')
    expect(htmlToMarkdown('<ol><li>a</li></ol>')).toBe('1. a')
  })

  it('引用与分割线', () => {
    expect(htmlToMarkdown('<blockquote>q</blockquote>')).toBe('> q')
    expect(htmlToMarkdown('<hr>')).toBe('---')
  })

  it('带语言标记的代码块', () => {
    const md = htmlToMarkdown('<pre><code class="language-js">const x = 1</code></pre>')
    expect(md).toContain('```js')
    expect(md).toContain('const x = 1')
  })

  it('表格转为 Markdown 表格', () => {
    const md = htmlToMarkdown(
      '<table><tr><th>a</th><th>b</th></tr><tr><td>1</td><td>2</td></tr></table>',
    )
    expect(md).toContain('| a |')
    expect(md).toContain('| 1 |')
  })

  it('script / style 内容被丢弃', () => {
    expect(htmlToMarkdown('<script>evil()</script><p>ok</p>')).toBe('ok')
    expect(htmlToMarkdown('<style>.x{}</style><p>ok</p>')).toBe('ok')
  })

  it('空 HTML 返回空字符串', () => {
    expect(htmlToMarkdown('')).toBe('')
  })
})
