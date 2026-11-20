/** 预览中心：左侧文件切换、右侧大屏预览 / 源码、全屏沉浸模式 */
import { useState } from 'react';
import { formatSize } from '../converter';
import { useStore } from '../store';
import { EmptyState, extensionOf, MarkdownView, PageHeading, StatusBadge } from '../ui';

export default function Preview() {
  const {
    doneItems, selected, selectedId, selectItem,
    copyText, copiedId, downloadText, saveToHistory, settings,
  } = useStore();
  const [tab, setTab] = useState<'preview' | 'source'>('preview');
  const [full, setFull] = useState(false);

  const quickExport = () => {
    if (!selected?.markdown) return;
    if (settings.defaultExport === 'clipboard') {
      void copyText(selected.markdown, 'center-export');
    } else {
      downloadText(selected.targetName, selected.markdown, `已下载 ${selected.targetName}`);
    }
  };

  return (
    <main className={`page preview-center${full ? ' is-fullscreen' : ''}`}>
      <PageHeading
        icon="◫"
        title="预览中心"
        subtitle="告别小窗口，专注阅读每一份转换结果；源码与渲染可随时切换"
        aside={
          <button type="button" className="btn btn-ghost" onClick={() => setFull((value) => !value)}>
            {full ? '退出全屏' : '⛶ 全屏模式'}
          </button>
        }
      />

      <div className="preview-split">
        <aside className="panel preview-files">
          <div className="side-title">
            <span>可预览文件</span>
            <em className="count">{doneItems.length}</em>
          </div>
          {doneItems.length === 0 ? (
            <p className="side-empty">还没有转换结果，先去工作台拖入文件。</p>
          ) : (
            <ul className="file-list">
              {doneItems.map((item) => (
                <li
                  key={item.id}
                  className={`file-row${selectedId === item.id ? ' active' : ''}`}
                  onClick={() => selectItem(item.id)}
                >
                  <div className="file-ext">{extensionOf(item.name)}</div>
                  <div className="file-main">
                    <div className="file-name" title={item.name}>{item.name}</div>
                    <div className="file-meta">{item.markdown.length} 字符 · {formatSize(item.size)}</div>
                  </div>
                  <StatusBadge status={item.status} />
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="panel preview-stage">
          <div className="toolbar wrap">
            <div className="tabs">
              <button type="button" className={tab === 'preview' ? 'on' : ''} onClick={() => setTab('preview')}>
                渲染预览
              </button>
              <button type="button" className={tab === 'source' ? 'on' : ''} onClick={() => setTab('source')}>
                Markdown 源码
              </button>
            </div>
            <div className="toolbar-group">
              {selected?.markdown && (
                <>
                  <button type="button" className="btn btn-ghost" onClick={() => void copyText(selected.markdown, selected.id)}>
                    {copiedId === selected.id ? '已复制 ✓' : '复制'}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => saveToHistory(selected)}>
                    存入历史
                  </button>
                  <button type="button" className="btn btn-primary" onClick={quickExport}>
                    {settings.defaultExport === 'clipboard' ? '复制（默认）' : '下载 .md（默认）'}
                  </button>
                </>
              )}
            </div>
          </div>

          {!selected || !selected.markdown ? (
            <EmptyState
              icon="◫"
              title="暂无可预览内容"
              description="转换完成后，这里会显示完整的 Markdown 渲染效果。"
              action={<a className="btn btn-primary" href="#/convert">去转换文件 →</a>}
            />
          ) : tab === 'source' ? (
            <pre className="source-view"><code>{selected.markdown}</code></pre>
          ) : (
            <MarkdownView markdown={selected.markdown} />
          )}

          {selected && (
            <div className="preview-foot">
              <span title={selected.name}>{selected.name} → {selected.targetName}</span>
              <span>{settings.theme === 'light' ? '☀ 亮色预览' : '☾ 暗色预览'}</span>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
