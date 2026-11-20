/** 转换历史：localStorage 中的结果存档，可预览、重新加载与删除 */
import { useState } from 'react';
import { formatSize } from '../converter';
import { useStore } from '../store';
import { EmptyState, extensionOf, MarkdownView, PageHeading, StatusBadge } from '../ui';

export default function History() {
  const { history, loadFromHistory, removeHistory, clearHistory, notify } = useStore();
  const [expanded, setExpanded] = useState<string | null>(null);
  const totalChars = history.reduce((sum, entry) => sum + entry.markdown.length, 0);
  const active = history.find((entry) => entry.id === expanded) ?? null;

  return (
    <main className="page">
      <PageHeading
        icon="◷"
        title="转换历史"
        subtitle="每次成功转换都会自动留档（可在设置中关闭），随时把结果重新加载回工作台"
        aside={
          <div className="stat-cluster">
            <span className="stat-chip"><b>{history.length}</b> 条记录</span>
            <span className="stat-chip"><b>{totalChars.toLocaleString()}</b> 字符</span>
          </div>
        }
      />

      <section className="panel">
        <div className="toolbar">
          <span className="toolbar-note">仅保存在这台设备的浏览器里，不会同步到任何服务器</span>
          <button
            type="button"
            className="btn btn-danger"
            disabled={!history.length}
            onClick={() => {
              if (window.confirm('确定清空全部转换历史吗？')) clearHistory();
            }}
          >
            清空历史
          </button>
        </div>

        {history.length === 0 ? (
          <EmptyState
            icon="◷"
            title="还没有历史记录"
            description="完成一次转换后，结果会自动出现在这里；也可以在预览中心手动存入。"
            action={<a className="btn btn-primary" href="#/convert">开始转换 →</a>}
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>时间</th>
                  <th>文件</th>
                  <th>状态</th>
                  <th>大小</th>
                  <th>字符数</th>
                  <th className="col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr key={entry.id}>
                    <td className="mono muted-cell">
                      {new Date(entry.createdAt).toLocaleString('zh-CN', { hour12: false })}
                    </td>
                    <td>
                      <span className="inline-ext">{extensionOf(entry.name)}</span>
                      <span className="cell-name" title={entry.name}>{entry.name}</span>
                      <div className="sub-line mono">→ {entry.targetName}</div>
                    </td>
                    <td><StatusBadge status={entry.status} /></td>
                    <td className="mono">{formatSize(entry.size)}</td>
                    <td className="mono">{entry.markdown.length.toLocaleString()}</td>
                    <td className="col-actions">
                      <button type="button" className="mini-btn" onClick={() => { loadFromHistory(entry.id); window.location.hash = '#/convert'; }}>
                        重新加载
                      </button>
                      <button
                        type="button"
                        className="mini-btn"
                        onClick={() => setExpanded((current) => (current === entry.id ? null : entry.id))}
                      >
                        {expanded === entry.id ? '收起' : '预览'}
                      </button>
                      <button
                        type="button"
                        className="mini-btn danger"
                        onClick={() => { removeHistory(entry.id); if (expanded === entry.id) setExpanded(null); notify('已删除该历史记录'); }}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {active && (
        <section className="panel history-preview">
          <div className="side-title">
            <span>历史预览 · {active.name}</span>
            <button type="button" className="text-btn" onClick={() => setExpanded(null)}>收起</button>
          </div>
          <MarkdownView markdown={active.markdown} />
        </section>
      )}
    </main>
  );
}
