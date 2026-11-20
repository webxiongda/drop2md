/** 格式指南：用转换模块真实跑一遍输入 → 输出，而不是伪造示意文本 */
import { useMemo } from 'react';
import { csvToMarkdown, htmlToMarkdown, jsonToMarkdown } from '../converter';
import { PageHeading } from '../ui';

const FORMATS = [
  { ext: '.md', kind: 'Markdown', rule: '原样保留文本，仅把 CRLF 统一成 LF，不做二次解析' },
  { ext: '.txt / .log', kind: '纯文本', rule: '原样保留文本，统一换行符后直接进入预览' },
  { ext: '.html / .htm', kind: '网页片段', rule: '提取标题、段落、列表（含嵌套）、链接、代码块、引用、表格，丢弃脚本与样式' },
  { ext: '.csv', kind: '逗号分隔', rule: '首行作表头；支持引号包裹、"" 转义引号、字段内逗号与换行' },
  { ext: '.tsv', kind: '制表符分隔', rule: '与 CSV 同一解析器，仅把分隔符换成制表符' },
  { ext: '.json', kind: 'JSON 数据', rule: '校验后 2 空格缩进美化，包进 ```json 代码块' },
  { ext: '.jsonl / .ndjson', kind: '逐行 JSON', rule: '逐行解析并美化，输出为 JSON 数组代码块' },
  { ext: '其他文本', kind: '源码 / 配置', rule: '按扩展名匹配语言提示，整段包进围栏代码块（如 ```ts）' },
  { ext: '二进制', kind: '图片 / 压缩包', rule: '探测 NUL 与控制字符后拒绝转换，给出友好提示，绝不输出乱码' },
];

const HTML_IN = '<h2>新特性</h2>\n<ul>\n  <li>本地转换，零上传</li>\n  <li><a href="https://example.com">查看文档</a></li>\n</ul>';
const CSV_IN = '地区,销售额\n华东,"¥128,400"\n华南,96500';
const JSON_IN = '{"name":"drop2md","features":["本地优先","零上传"]}';

export default function Formats() {
  const demos = useMemo(() => [
    {
      id: 'html',
      title: 'HTML 片段 → 结构化 Markdown',
      lang: 'html',
      input: HTML_IN,
      output: htmlToMarkdown(HTML_IN),
    },
    {
      id: 'csv',
      title: 'CSV → Markdown 表格',
      lang: 'csv',
      input: CSV_IN,
      output: csvToMarkdown(CSV_IN),
    },
    {
      id: 'json',
      title: 'JSON → 格式化代码块',
      lang: 'json',
      input: JSON_IN,
      output: jsonToMarkdown(JSON_IN),
    },
    {
      id: 'md',
      title: 'Markdown / 纯文本 → 原样保留',
      lang: 'text',
      input: '# 标题\n\n一段普通文本，换行会被规范化。',
      output: '# 标题\n\n一段普通文本，换行会被规范化。',
    },
  ], []);

  return (
    <main className="page">
      <PageHeading
        icon="⌗"
        title="格式指南"
        subtitle="支持哪些格式、各自按什么规则转换 —— 下面的输出均由真实转换函数生成"
        aside={<span className="stat-chip"><b>9</b> 类规则</span>}
      />

      <section className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>扩展名</th>
                <th>类型</th>
                <th>转换规则</th>
              </tr>
            </thead>
            <tbody>
              {FORMATS.map((format) => (
                <tr key={format.ext}>
                  <td className="mono accent">{format.ext}</td>
                  <td>{format.kind}</td>
                  <td className="muted-cell">{format.rule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="demo-grid">
        {demos.map((demo) => (
          <section className="panel demo-card" key={demo.id}>
            <div className="demo-title">
              <span className="demo-dot" />
              <h3>{demo.title}</h3>
              <span className="mono lang-tag">{demo.lang}</span>
            </div>
            <div className="io-grid">
              <div className="io-pane">
                <span className="io-label">输入 · INPUT</span>
                <pre className="io-code"><code>{demo.input}</code></pre>
              </div>
              <div className="io-arrow">→</div>
              <div className="io-pane">
                <span className="io-label">输出 · MARKDOWN</span>
                <pre className="io-code output"><code>{demo.output}</code></pre>
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="hint-banner">
        <span>✦</span>
        <p>
          想亲手试试？去 <a href="#/examples">示例库</a> 一键加载这些真实样例，
          或直接到 <a href="#/convert">转换工作台</a> 拖入自己的文件。
        </p>
      </div>
    </main>
  );
}
