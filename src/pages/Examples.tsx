/** 示例库：内置样例 + 手写小例子，复用同一条 File → 转换链路 */
import { SAMPLES, sampleToFile } from '../samples';
import type { SampleDef } from '../samples';
import { useStore } from '../store';
import { PageHeading } from '../ui';

const EXTRA_SAMPLES: SampleDef[] = [
  {
    id: 'tsv',
    label: 'TSV 制表符表格',
    description: '字段含制表符时自动转义为表格',
    badge: 'TSV',
    tone: 'blue',
    name: '区域销量.tsv',
    content: '城市\t产品\t销量\n上海\tAlpha\t1284\n深圳\tBeta\t965\n北京\tGamma\t732',
  },
  {
    id: 'jsonl',
    label: 'JSONL 逐行日志',
    description: '每行一条 JSON，输出为数组代码块',
    badge: 'L',
    tone: 'purple',
    name: '事件日志.jsonl',
    content: '{"ts":"2026-11-20T09:00:00Z","event":"upload","ok":true}\n{"ts":"2026-11-20T09:01:00Z","event":"convert","ok":true}',
  },
  {
    id: 'code',
    label: 'TypeScript 源码',
    description: '按扩展名自动加语言提示',
    badge: 'TS',
    tone: 'orange',
    name: 'utils.ts',
    content: 'export function slugify(input: string): string {\n  return input.trim().toLowerCase().replace(/\\s+/g, "-");\n}',
  },
  {
    id: 'md',
    label: 'Markdown 片段',
    description: '已是 Markdown 就原样保留',
    badge: 'MD',
    tone: 'green',
    name: '笔记.md',
    content: '# 会议纪要\n\n- **结论**：本地处理，零上传\n- 下一步：整理格式指南\n\n> 所有数据都留在自己的浏览器里。',
  },
];

const ALL_SAMPLES = [...SAMPLES, ...EXTRA_SAMPLES];

export default function Examples() {
  const { addFiles } = useStore();

  return (
    <main className="page">
      <PageHeading
        icon="✦"
        title="示例库"
        subtitle="每个样例都会构造真实的 File 对象，走和拖拽完全相同的转换链路"
        aside={<span className="stat-chip"><b>{ALL_SAMPLES.length}</b> 个可加载样例</span>}
      />

      <div className="example-grid">
        {ALL_SAMPLES.map((sample) => (
          <section className="panel example-card" key={sample.id}>
            <div className="example-top">
              <span className={`sample-badge ${sample.tone}`}>{sample.badge}</span>
              <div>
                <h3>{sample.label}</h3>
                <p>{sample.description}</p>
              </div>
            </div>
            <div className="example-file mono">↳ {sample.name}</div>
            <pre className="example-code"><code>{sample.content}</code></pre>
            <div className="example-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  addFiles([sampleToFile(sample)]);
                  window.location.hash = '#/convert';
                }}
              >
                加载到工作台 →
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => addFiles([sampleToFile(sample)])}>
                仅加入队列
              </button>
            </div>
          </section>
        ))}
      </div>

      <div className="hint-banner">
        <span>✦</span>
        <p>样例只是起点。工作台支持任意文本文件多选拖入，转换规则详见 <a href="#/formats">格式指南</a>。</p>
      </div>
    </main>
  );
}
