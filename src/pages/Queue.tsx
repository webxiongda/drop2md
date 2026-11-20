/** 文件队列：独立管理所有已加入文件，支持选择、移除、清空与批量下载 */
import { useEffect, useMemo, useState } from 'react';
import { formatSize } from '../converter';
import { useStore } from '../store';
import { EmptyState, extensionOf, PageHeading, StatusBadge } from '../ui';

export default function Queue() {
  const { items, doneItems, selectedId, selectItem, removeItem, clearQueue, downloadItems, notify } = useStore();
  const [picked, setPicked] = useState<Set<string>>(new Set());

  // 文件被移除后同步清理勾选项
  useEffect(() => {
    setPicked((prev) => {
      const valid = new Set(items.map((item) => item.id));
      const next = new Set([...prev].filter((id) => valid.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [items]);

  const chosen = useMemo(
    () => doneItems.filter((item) => picked.has(item.id)),
    [doneItems, picked],
  );
  const allPicked = doneItems.length > 0 && chosen.length === doneItems.length;

  const toggleAll = () => {
    setPicked(allPicked ? new Set() : new Set(doneItems.map((item) => item.id)));
  };

  const openInWorkbench = (id: string) => {
    selectItem(id);
    window.location.hash = '#/convert';
  };

  return (
    <main className="page">
      <PageHeading
        icon="≡"
        title="文件队列"
        subtitle="所有加入过的文件都在这里，转换状态与目标文件名一目了然"
        aside={
          <div className="stat-cluster">
            <span className="stat-chip"><b>{items.length}</b> 个文件</span>
            <span className="stat-chip"><b>{doneItems.length}</b> 个已完成</span>
          </div>
        }
      />

      <section className="panel">
        <div className="toolbar">
          <div className="toolbar-group">
            <button type="button" className="btn btn-ghost" onClick={toggleAll} disabled={!doneItems.length}>
              {allPicked ? '取消全选' : '全选可下载项'}
            </button>
            <button type="button" className="btn btn-primary" onClick={() => downloadItems(chosen)} disabled={!chosen.length}>
              下载已选 ↓ ({chosen.length})
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => downloadItems(doneItems)} disabled={!doneItems.length}>
              下载全部
            </button>
          </div>
          <button
            type="button"
            className="btn btn-danger"
            disabled={!items.length}
            onClick={() => {
              if (window.confirm('确定清空整个转换队列吗？此操作不影响转换历史。')) {
                clearQueue();
              }
            }}
          >
            清空队列
          </button>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon="≡"
            title="队列是空的"
            description="把文件拖进转换工作台，或先去示例库挑一个样例试试。"
            action={<a className="btn btn-primary" href="#/convert">前往转换工作台 →</a>}
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="col-check">选</th>
                  <th>文件</th>
                  <th>大小</th>
                  <th>状态</th>
                  <th>目标 Markdown</th>
                  <th className="col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className={selectedId === item.id ? 'row-active' : ''}>
                    <td className="col-check">
                      <input
                        type="checkbox"
                        aria-label={`选择 ${item.name}`}
                        disabled={item.status !== 'done' || !item.markdown}
                        checked={picked.has(item.id)}
                        onChange={() => setPicked((prev) => {
                          const next = new Set(prev);
                          if (next.has(item.id)) next.delete(item.id);
                          else next.add(item.id);
                          return next;
                        })}
                      />
                    </td>
                    <td>
                      <button type="button" className="cell-link" onClick={() => openInWorkbench(item.id)}>
                        <span className="inline-ext">{extensionOf(item.name)}</span>
                        <span className="cell-name" title={item.name}>{item.name}</span>
                      </button>
                    </td>
                    <td className="mono">{formatSize(item.size)}</td>
                    <td><StatusBadge status={item.status} /></td>
                    <td className="mono target-name">{item.targetName}</td>
                    <td className="col-actions">
                      <button
                        type="button"
                        className="mini-btn"
                        disabled={!item.markdown}
                        onClick={() => downloadItems([item])}
                      >
                        ↓ 下载
                      </button>
                      <button
                        type="button"
                        className="mini-btn danger"
                        onClick={() => { removeItem(item.id); notify(`已移除 ${item.name}`); }}
                      >
                        移除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
