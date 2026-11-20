/** 转换工作台：保留原有拖拽、队列与实时预览的完整主流程 */
import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, KeyboardEvent } from 'react';
import { formatSize } from '../converter';
import { SAMPLES, sampleToFile } from '../samples';
import { useStore } from '../store';
import { extensionOf, MarkdownView, StatusBadge } from '../ui';

function EmptyPreview() {
  return (
    <div className="empty-preview">
      <svg viewBox="0 0 160 140" aria-hidden="true">
        <defs>
          <linearGradient id="docGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <rect x="34" y="14" width="74" height="98" rx="10" fill="rgba(110,231,183,0.06)" stroke="url(#docGradient)" strokeWidth="2" />
        <line x1="48" y1="40" x2="92" y2="40" stroke="#6ee7b7" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
        <line x1="48" y1="56" x2="80" y2="56" stroke="#6ee7b7" strokeWidth="3" strokeLinecap="round" opacity="0.45" />
        <line x1="48" y1="70" x2="88" y2="70" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
        <line x1="48" y1="84" x2="72" y2="84" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" opacity="0.25" />
        <path d="M112 96 l16 16 m0 -16 l-16 16" stroke="#6ee7b7" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
        <circle cx="120" cy="40" r="4" fill="#22d3ee" opacity="0.7" />
        <circle cx="136" cy="64" r="3" fill="#34d399" opacity="0.6" />
        <circle cx="24" cy="92" r="3" fill="#6ee7b7" opacity="0.5" />
      </svg>
      <h3>预览会在这里出现</h3>
      <p>拖入文件、点击示例，或从左侧选择一个转换结果</p>
    </div>
  );
}

export default function Convert() {
  const {
    items, selected, selectedId, doneItems, copiedId,
    addFiles, removeItem, selectItem, copyText, downloadText, downloadItems,
  } = useStore();
  const [dragging, setDragging] = useState(false);
  const [tab, setTab] = useState<'preview' | 'source'>('preview');
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = '';
  };

  const onDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  };
  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };
  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setDragging(false);
    }
  };
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    addFiles(Array.from(event.dataTransfer.files));
  };
  const onDropzoneKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      inputRef.current?.click();
    }
  };



  return (
    <main className="workspace">
      <section className="pane pane-left">
        <input
          ref={inputRef}
          className="visually-hidden"
          type="file"
          multiple
          onChange={onInputChange}
          onClick={(event) => event.stopPropagation()}
        />
        <div
          className={`dropzone${dragging ? ' is-dragging' : ''}`}
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={onDropzoneKeyDown}
          role="button"
          tabIndex={0}
          aria-label="拖入文件或点击选择文件"
        >
          <div className="drop-glow" />
          <div className="drop-icon">
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <path d="M24 32 V10 m0 0 l-8 8 m8 -8 l8 8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 30 v5 a5 5 0 0 0 5 5 h22 a5 5 0 0 0 5 -5 v-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <h2>{dragging ? '松手，开始转换' : '拖入文件，即刻转换'}</h2>
          <p>支持多选 · .md .txt .html .csv .json 等文本格式</p>
          <span className="drop-cta">或点击选择文件 <b>→</b></span>
        </div>

        <div className="block samples-block">
          <div className="section-label">
            <span>试试示例 <em className="count">3</em></span>
            <small>一键体验完整流程</small>
          </div>
          <div className="sample-grid">
            {SAMPLES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                className="sample-card"
                onClick={() => addFiles([sampleToFile(sample)])}
              >
                <span className={`sample-badge ${sample.tone}`}>{sample.badge}</span>
                <strong>{sample.label}</strong>
                <small>{sample.description}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="block queue-block">
          <div className="section-label">
            <span>转换队列 <em className="count">{items.length}</em></span>
            <button type="button" className="text-btn" onClick={() => downloadItems(doneItems)} disabled={!doneItems.length}>
              全部下载 ↓
            </button>
          </div>
          {items.length === 0 ? (
            <div className="queue-empty">还没有文件，拖一个进来吧 ✨</div>
          ) : (
            <ul className="file-list">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={`file-row${selectedId === item.id ? ' active' : ''}`}
                  onClick={() => selectItem(item.id)}
                >
                  <div className="file-ext">{extensionOf(item.name)}</div>
                  <div className="file-main">
                    <div className="file-name" title={item.name}>{item.name}</div>
                    <div className="file-meta">
                      {formatSize(item.size)} <span>·</span>{' '}
                      <span className="target-name">→ {item.targetName}</span>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                  <div className="row-actions">
                    {item.markdown && (
                      <button
                        type="button"
                        title="复制结果"
                        onClick={(event) => { event.stopPropagation(); void copyText(item.markdown, item.id); }}
                      >
                        {copiedId === item.id ? '✓' : '⧉'}
                      </button>
                    )}
                    {item.markdown && (
                      <button
                        type="button"
                        title="下载 .md"
                        onClick={(event) => {
                          event.stopPropagation();
                          downloadText(item.targetName, item.markdown, `已下载 ${item.targetName}`);
                        }}
                      >
                        ↓
                      </button>
                    )}
                    <button
                      type="button"
                      title="移除"
                      className="remove"
                      onClick={(event) => { event.stopPropagation(); removeItem(item.id); }}
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="pane pane-right">
        <div className="preview-bar">
          <div className="tabs">
            <button type="button" className={tab === 'preview' ? 'on' : ''} onClick={() => setTab('preview')}>
              实时预览
            </button>
            <button type="button" className={tab === 'source' ? 'on' : ''} onClick={() => setTab('source')}>
              Markdown 源码
            </button>
          </div>
          <div className="preview-actions">
            {selected?.markdown && (
              <>
                <button type="button" className="ghost-btn" onClick={() => void copyText(selected.markdown, selected.id)}>
                  {copiedId === selected.id ? '已复制 ✓' : '复制'}
                </button>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => downloadText(selected.targetName, selected.markdown, `已下载 ${selected.targetName}`)}
                >
                  下载 .md
                </button>
              </>
            )}
          </div>
        </div>

        {!selected ? (
          <EmptyPreview />
        ) : selected.status === 'converting' ? (
          <div className="notice-state">
            <div className="loader" />
            <h3>正在本地转换…</h3>
            <p>文件没有离开你的浏览器</p>
          </div>
        ) : selected.status === 'binary' || selected.status === 'error' ? (
          <div className="notice-state">
            <div className="notice-icon">!</div>
            <h3>{selected.status === 'binary' ? '无法转换这个文件' : '转换出错了'}</h3>
            <p>{selected.message}</p>
          </div>
        ) : tab === 'source' ? (
          <pre className="source-view"><code>{selected.markdown}</code></pre>
        ) : (
          <MarkdownView markdown={selected.markdown} />
        )}

        {selected && (
          <div className="preview-foot">
            <span title={selected.name}>{selected.name}</span>
            <span>
              {selected.markdown.length.toLocaleString()} 字符 · {formatSize(new Blob([selected.markdown]).size)}
            </span>
          </div>
        )}
      </section>
    </main>
  );
}
