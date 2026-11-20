/** 页面注册信息：hash 路由与顶部导航共用同一份定义 */

export type PageId =
  | 'convert'
  | 'queue'
  | 'preview'
  | 'formats'
  | 'history'
  | 'examples'
  | 'batch'
  | 'guide'
  | 'about'
  | 'settings';

export interface PageDef {
  id: PageId;
  path: string;
  label: string;
  short: string;
  icon: string;
  hint: string;
}

export const PAGES: PageDef[] = [
  { id: 'convert', path: '#/convert', label: '转换工作台', short: '工作台', icon: '⇄', hint: '拖入文件，即刻得到干净的 Markdown' },
  { id: 'queue', path: '#/queue', label: '文件队列', short: '队列', icon: '≡', hint: '管理已加入的全部文件与转换状态' },
  { id: 'preview', path: '#/preview', label: '预览中心', short: '预览', icon: '◫', hint: '大屏预览与源码对照，支持全屏沉浸' },
  { id: 'formats', path: '#/formats', label: '格式指南', short: '格式', icon: '⌗', hint: '每种格式怎么转，输入与输出一看就懂' },
  { id: 'history', path: '#/history', label: '转换历史', short: '历史', icon: '◷', hint: '本地保存的转换结果，随时重新加载' },
  { id: 'examples', path: '#/examples', label: '示例库', short: '示例', icon: '✦', hint: '一键加载真实样例，快速体验完整流程' },
  { id: 'batch', path: '#/batch', label: '批量操作', short: '批量', icon: '⤓', hint: '批量重命名、汇总表格与下载清单' },
  { id: 'guide', path: '#/guide', label: '使用指南', short: '指南', icon: '?', hint: '四步上手，隐私永远优先' },
  { id: 'about', path: '#/about', label: '关于与热点', short: '关于', icon: '◈', hint: '缘起、社区热点、技术栈与 License' },
  { id: 'settings', path: '#/settings', label: '设置', short: '设置', icon: '⚙', hint: '预览主题、默认导出与历史策略' },
];

/** 把 hash 片段解析成合法页面 id，未知值一律回落到工作台 */
export function pageFromHash(hash: string): PageId {
  const raw = hash.replace(/^#\/?/, '').split(/[?/]/)[0];
  return PAGES.some((page) => page.id === raw) ? (raw as PageId) : 'convert';
}
