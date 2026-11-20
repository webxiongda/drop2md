/** 各页面复用的展示件：标题、状态徽标、文件类型与安全 Markdown 视图 */
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { formatSize } from './converter';
import { renderMarkdown } from './markdown';
import { useStore } from './store';
import type { ConvertItem } from './store';

export function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.');
  const ext = dot >= 0 ? name.slice(dot + 1).toLowerCase() : 'file';
  return ext.slice(0, 4).toUpperCase() || 'FILE';
}

export function PageHeading({
  icon,
  title,
  subtitle,
  aside,
}: {
  icon: string;
  title: string;
  subtitle: string;
  aside?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div className="page-heading-icon">{icon}</div>
      <div className="page-heading-copy">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {aside && <div className="page-heading-aside">{aside}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: ConvertItem['status'] }) {
  if (status === 'converting') {
    return <span className="status converting"><i />转换中</span>;
  }
  if (status === 'done') return <span className="status done">✓ 完成</span>;
  if (status === 'binary') return <span className="status binary">二进制</span>;
  return <span className="status error">失败</span>;
}

/** HTML 仅由自带转义渲染器生成，用户文本不会直接进入 DOM */
export function MarkdownView({ markdown }: { markdown: string }) {
  const { settings } = useStore();
  const html = useMemo(() => renderMarkdown(markdown), [markdown]);
  return (
    <article
      className="markdown-body"
      data-theme={settings.theme}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

/** 批量页与清单共用的单元格转义，避免竖线破坏 Markdown 表格 */
export function mdCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

export { formatSize };
