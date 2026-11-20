/** 批量操作：汇总表格、批量改名、勾选下载与可复制的下载清单 */
import { useEffect, useMemo, useState } from 'react';
import { formatSize, toMdName } from '../converter';
import { useStore } from '../store';
import { EmptyState, extensionOf, mdCell, PageHeading } from '../ui';

export default function Batch() {
  const {
    items, doneItems, copiedId,
    renameItem, downloadItems, copyText, downloadText, notify,
  } = useStore();
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [normalizeInfo, setNormalizeInfo] = useState('');

  useEffect(() => {
    setPicked((prev) => {
      const valid = new Set(doneItems.map((item) => item.id));
      const next = new Set([...prev].filter((id) => valid.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [doneItems]);

  const chosen = useMemo(
    () => doneItems.filter((item) => picked.has(item.id)),
    [doneItems, picked],
  );
  const totalSize = doneItems.reduce((sum, item) => sum + item.size, 0);
  const totalChars = doneItems.reduce((sum, item) => sum + item.markdown.length, 0);

  const manifest = useMemo(() => {
    const lines = [
      '# 批量转换清单',
      '',
      `- 生成时间：${new Date().toLocaleString('zh-CN', { hour12: false })}`,
      `- 文件数量：${doneItems.length}`,
      `- 源数据总量：${formatSize(doneItems.reduce((sum, item) => sum + item.size, 0))}`,
      `- 输出字符数：${doneItems.reduce((sum, item) => sum + item.markdown.length, 0).toLocaleString()}`,
      '',
      '| 原文件 | 目标文件 | 大小 | 字符数 |',
      '| --- | --- | ---: | ---: |',
      ...doneItems.map((item) => (
        `| ${mdCell(item.name)} | ${mdCell(item.targetName)} | ${formatSize(item.size)} | ${item.markdown.length} |`
      )),
      '',
      '> 全部转换均在浏览器本地完成，文件未上传。',
      '',
    ];
    return lines.join('\n');
  }, [doneItems]);

  return (
    <main className="page">
      <PageHeading
        icon="⤓"
        title="批量操作"
        subtitle="一次看清所有转换结果：改文件名、勾选下载，并生成可分享的下载清单"
        aside={
          <div className="stat-cluster">
            <span className="stat-chip"><b>{doneItems.length}</b> 个结果</span>
            <span className="stat-chip"><b>{formatSize(totalSize)}</b> 源数据</span>
            <span className="stat-chip"><b>{totalChars.toLocaleString()}</b> 字符</span>
          </div>
        }
      />

      <section className="panel">
        <div className="toolbar wrap">
          <div className="toolbar-group">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={!doneItems.length}
              onClick={() => setPicked(
                chosen.length === doneItems.length ? new Set() : new Set(doneItems.map((item) => item.id)),
              )}
            >
              {chosen.length === doneItems.length && doneItems.length > 0 ? '取消全选' : '全选'}
            </button>
            <button type="button" className="btn btn-primary" disabled={!chosen.length} onClick={() => downloadItems(chosen)}>
              下载已选 ↓ ({chosen.length})
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={!items.length}
              onClick={() => {
                items.forEach((item) => renameItem(item.id, toMdName(item.name)));
                setNormalizeInfo(`已把 ${items.length} 个目标文件名统一为同名 .md`);
                notify('批量重命名完成');
              }}
            >
              批量重命名为 .md
            </button>
          </div>
          {normalizeInfo && <span className="inline-note">✓ {normalizeInfo}</span>}
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon="⤓"
            title="还没有可批量处理的文件"
            description="加入多个文件后，这里会汇总成一张表，支持逐行改名与批量下载。"
            action={<a className="btn btn-primary" href="#/convert">去添加文件 →</a>}
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="col-check">选</th>
                  <th>原文件</th>
                  <th>目标文件名（可编辑）</th>
                  <th>大小</th>
                  <th>字符数</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="col-check">
                      <input
                        type="checkbox"
                        aria-label={`选择 ${item.name}`}
                        disabled={!item.markdown}
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
                      <span className="inline-ext">{extensionOf(item.name)}</span>
                      <span className="cell-name" title={item.name}>{item.name}</span>
                    </td>
                    <td>
                      <input
                        className="name-input mono"
                        value={item.targetName}
                        aria-label={`重命名 ${item.name}`}
                        onChange={(event) => renameItem(item.id, event.target.value)}
                      />
                    </td>
                    <td className="mono">{formatSize(item.size)}</td>
                    <td className="mono">{item.markdown.length.toLocaleString()}</td>
                    <td>{item.status === 'done' ? <span className="status done">✓ 完成</span> : <span className="status error">未完成</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel manifest-panel">
        <div className="toolbar">
          <div>
            <h3 className="panel-title">下载清单</h3>
            <p className="panel-sub">Markdown 表格格式，复制后可贴到文档或 Issue 里</p>
          </div>
          <div className="toolbar-group">
            <button type="button" className="btn btn-ghost" onClick={() => void copyText(manifest, 'manifest')}>
              {copiedId === 'manifest' ? '已复制 ✓' : '复制清单'}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!doneItems.length}
              onClick={() => downloadText('drop2md-manifest.md', manifest, '下载清单已生成')}
            >
              ↓ 下载清单 .md
            </button>
          </div>
        </div>
        <pre className="manifest-code"><code>{manifest}</code></pre>
      </section>
    </main>
  );
}
