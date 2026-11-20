/** 关于与热点：项目缘起、社区信号、技术栈与许可证 */
import { PageHeading } from '../ui';

const SIGNALS = [
  {
    value: '+434',
    label: 'stars',
    title: 'microsoft/markitdown 热度攀升',
    detail: '“万物转 Markdown” 的开源参考实现持续吸引关注，近期增长约 434 stars。',
    href: 'https://github.com/microsoft/markitdown/stargazers',
    link: '查看 stargazers ↗',
  },
  {
    value: '100%',
    label: 'local',
    title: '本地优先成为共识',
    detail: '浏览器内解析、无服务端、无上传，隐私与性能同时受益，是文档工具的重要趋势。',
    href: 'https://developer.mozilla.org/en-US/docs/Web/API/File_API',
    link: '了解 File API ↗',
  },
  {
    value: '0',
    label: 'backend',
    title: '零后端的朴素设计',
    detail: '静态文件即可部署，嵌入门户 iframe 也能用相对路径的 hash 路由正常访问。',
    href: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/hashchange_event',
    link: '了解 hash 路由 ↗',
  },
];

const STACK = [
  { name: 'React 18', role: '界面与状态' },
  { name: 'TypeScript', role: '严格类型 · tsc 零错误' },
  { name: 'Vite 5', role: '构建与开发服务器' },
  { name: 'DOMParser', role: '本地 HTML 解析' },
  { name: 'File API', role: '本地文件读取' },
  { name: '零额外依赖', role: '路由 / 渲染 / 转换全部自写' },
];

export default function About() {
  return (
    <main className="page">
      <PageHeading
        icon="◈"
        title="关于与热点"
        subtitle="为什么做这个工具、它站在哪些趋势上，以及它由什么构成"
        aside={<span className="pill ghost">v1.0 · MIT</span>}
      />

      <section className="panel about-hero">
        <div className="about-logo">M</div>
        <div className="about-copy">
          <h3>把任何文件，拖成干净的 Markdown</h3>
          <p>
            Drop2MD 灵感来自 <a href="https://github.com/microsoft/markitdown" target="_blank" rel="noreferrer">microsoft/markitdown</a>：
            把「万物转 Markdown」这件事搬进浏览器。没有服务端、没有上传、没有追踪，打开就能用。
          </p>
          <p className="about-quote">“你的文档只属于你的浏览器。”</p>
        </div>
      </section>

      <div className="signal-grid">
        {SIGNALS.map((signal) => (
          <section className="panel signal-card" key={signal.label}>
            <div className="signal-value">
              <b>{signal.value}</b>
              <span>{signal.label}</span>
            </div>
            <svg className="sparkline" viewBox="0 0 120 34" preserveAspectRatio="none" aria-hidden="true">
              <polyline
                points="0,28 14,25 26,27 38,20 50,22 62,15 76,17 88,10 100,12 112,4 120,3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h3>{signal.title}</h3>
            <p>{signal.detail}</p>
            <a href={signal.href} target="_blank" rel="noreferrer" className="signal-link">{signal.link}</a>
          </section>
        ))}
      </div>

      <div className="about-columns">
        <section className="panel">
          <div className="side-title"><span>技术栈</span></div>
          <ul className="stack-list">
            {STACK.map((item) => (
              <li key={item.name}>
                <span className="mono accent">{item.name}</span>
                <span className="muted-cell">{item.role}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel license-card">
          <div className="side-title"><span>许可证</span></div>
          <h3>MIT License</h3>
          <p>自由使用、修改与分发，只需保留版权声明。适合个人笔记、团队文档与二次开发。</p>
          <div className="license-actions">
            <a className="btn btn-ghost" href="https://opensource.org/license/mit" target="_blank" rel="noreferrer">查看 MIT 条款 ↗</a>
            <a className="btn btn-primary" href="https://github.com/microsoft/markitdown" target="_blank" rel="noreferrer">灵感来源 ↗</a>
          </div>
        </section>
      </div>
    </main>
  );
}
