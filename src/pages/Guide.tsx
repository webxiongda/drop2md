/** 使用指南：四步上手 + 隐私说明 + 常见问题 */
import { useState } from 'react';
import { PageHeading } from '../ui';

const STEPS = [
  {
    no: '01',
    icon: '⇥',
    title: '拖进来',
    body: '把文件拖到工作台左侧虚线区域，或点击区域一次选中多个文件。支持 .md / .txt / .html / .csv / .json 等文本格式。',
  },
  {
    no: '02',
    icon: '≡',
    title: '看队列',
    body: '每个文件会显示原名、大小、状态和目标 .md 名。点任意一行，右侧立刻切换到它的转换结果。',
  },
  {
    no: '03',
    icon: '◫',
    title: '读预览',
    body: '在「实时预览」和「Markdown 源码」之间切换；想看得更舒服，就去预览中心开全屏模式。',
  },
  {
    no: '04',
    icon: '⤓',
    title: '带走它',
    body: '复制 Markdown、下载单个 .md，或在批量操作页生成下载清单。成功结果会自动留在本机历史里。',
  },
];

const FAQS = [
  {
    q: '文件会被上传到服务器吗？',
    a: '不会。读取用 File.text() / File.arrayBuffer()，HTML 解析用浏览器内置 DOMParser，整个应用没有任何网络请求，断网也能正常使用。',
  },
  {
    q: '支持哪些格式？',
    a: 'Markdown、纯文本、日志、HTML、CSV、TSV、JSON、JSONL 以及常见源码/配置文件；二进制文件会被识别并给出提示，不会输出乱码。',
  },
  {
    q: '转换历史保存在哪里？',
    a: '保存在当前浏览器的 localStorage 中，只属于这台设备。你可以在设置页关闭自动存历史，或随时清空。',
  },
  {
    q: '预览里的链接安全吗？',
    a: '渲染器先对全部文本做 HTML 转义，再对链接协议做白名单（仅 http/https/mailto/锚点/相对路径），用户内容不会变成可执行脚本。',
  },
];

export default function Guide() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <main className="page">
      <PageHeading
        icon="?"
        title="使用指南"
        subtitle="拖进来就行 —— 四步完成从文件到干净 Markdown 的全过程"
        aside={<a className="btn btn-primary" href="#/convert">开始使用 →</a>}
      />

      <section className="privacy-card">
        <div className="privacy-card-icon">◈</div>
        <div>
          <h3>隐私优先，不是口号</h3>
          <p>没有后端、没有账号、没有统计脚本。文件从拖入到下载，全程只在你自己的浏览器里流转；关掉网络，功能依旧完整。</p>
        </div>
        <span className="privacy-card-tag">LOCAL ONLY</span>
      </section>

      <div className="step-grid">
        {STEPS.map((step) => (
          <section className="panel step-card" key={step.no}>
            <span className="step-no">{step.no}</span>
            <div className="step-icon">{step.icon}</div>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </section>
        ))}
      </div>

      <section className="panel faq-panel">
        <div className="side-title"><span>常见问题</span><em className="count">{FAQS.length}</em></div>
        <div className="faq-list">
          {FAQS.map((item, index) => (
            <div className={`faq-item${open === index ? ' open' : ''}`} key={item.q}>
              <button type="button" onClick={() => setOpen((current) => (current === index ? null : index))}>
                <span>{item.q}</span>
                <b>{open === index ? '−' : '+'}</b>
              </button>
              {open === index && <p>{item.a}</p>}
            </div>
          ))}
        </div>
      </section>

      <div className="hint-banner">
        <span>✦</span>
        <p>还有疑问？先看看 <a href="#/formats">格式指南</a>，或者用 <a href="#/examples">示例库</a> 亲手跑一遍。</p>
      </div>
    </main>
  );
}
