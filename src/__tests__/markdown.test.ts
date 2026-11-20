import { describe, it, expect } from 'vitest'
import { renderMarkdown } from '../markdown'

describe('renderMarkdown 基础语法', () => {
  it('渲染标题', () => {
    expect(renderMarkdown('# Title')).toBe('<h1>Title</h1>')
    expect(renderMarkdown('### Sub')).toBe('<h3>Sub</h3>')
  })

  it('渲染段落与强调', () => {
    expect(renderMarkdown('hello world')).toBe('<p>hello world</p>')
    expect(renderMarkdown('**bold**')).toContain('<strong>bold</strong>')
    expect(renderMarkdown('*italic*')).toContain('<em>italic</em>')
  })

  it('渲染行内代码与围栏代码块', () => {
    expect(renderMarkdown('`code`')).toContain('<code>code</code>')
    const block = renderMarkdown('```js\nconst x = 1\n```')
    expect(block).toContain('code-lang')
    expect(block).toContain('const x = 1')
  })

  it('渲染无序列表与有序列表', () => {
    expect(renderMarkdown('- a\n- b')).toBe('<ul><li>a</li><li>b</li></ul>')
    expect(renderMarkdown('1. a\n2. b')).toBe('<ol><li>a</li><li>b</li></ol>')
  })

  it('渲染引用与分割线', () => {
    expect(renderMarkdown('> quote')).toBe('<blockquote>quote</blockquote>')
    expect(renderMarkdown('---')).toBe('<hr />')
  })

  it('渲染表格', () => {
    const html = renderMarkdown('| a | b |\n| --- | --- |\n| 1 | 2 |')
    expect(html).toContain('<table>')
    expect(html).toContain('<th>a</th>')
    expect(html).toContain('<td>1</td>')
  })

  it('安全链接生成 a 标签', () => {
    const html = renderMarkdown('[site](https://example.com)')
    expect(html).toContain('href="https://example.com"')
    expect(html).toContain('rel="noopener noreferrer"')
  })
})

describe('renderMarkdown XSS 防护', () => {
  it('尖括号与脚本被转义，不会变成真实标签', () => {
    const html = renderMarkdown('<script>alert(1)</script>')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('javascript: 协议链接被降级为纯文本', () => {
    const html = renderMarkdown('[x](javascript:alert(1))')
    expect(html).not.toContain('javascript:')
    expect(html).not.toContain('<a ')
  })

  it('含换行混淆的 javascript 链接同样被拦截', () => {
    const html = renderMarkdown('[x](java\nscript:alert(1))')
    expect(html).not.toContain('<a ')
  })

  it('事件属性文本被转义为纯文本', () => {
    const html = renderMarkdown('<img src=x onerror=alert(1)>')
    expect(html).toContain('&lt;img')
    expect(html).not.toContain('<img')
  })
})
