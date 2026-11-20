/** 设置：预览主题、默认导出与历史策略，全部持久化到 localStorage */
import { DEFAULT_SETTINGS, useStore } from '../store';
import type { Settings } from '../store';
import { PageHeading } from '../ui';

const THEMES: { value: Settings['theme']; icon: string; label: string; note: string }[] = [
  { value: 'dark', icon: '☾', label: '暗色', note: '霓虹青绿，默认选择' },
  { value: 'light', icon: '☀', label: '亮色', note: '纸面质感，适合长文阅读' },
];

const EXPORTS: { value: Settings['defaultExport']; icon: string; label: string; note: string }[] = [
  { value: 'md', icon: '↓', label: '下载 .md', note: '主按钮直接保存 Markdown 文件' },
  { value: 'clipboard', icon: '⧉', label: '复制内容', note: '主按钮把结果放进剪贴板' },
];

export default function SettingsPage() {
  const {
    settings, updateSettings, items, history,
    clearQueue, clearHistory, downloadText, notify,
  } = useStore();
  const storedBytes = new Blob([JSON.stringify({ items, history, settings })]).size;

  return (
    <main className="page settings-page">
      <PageHeading
        icon="⚙"
        title="设置"
        subtitle="偏好会立即保存，刷新页面后依然生效"
        aside={<span className="stat-chip"><b>{(storedBytes / 1024).toFixed(1)}</b> KB 本地数据</span>}
      />

      <section className="panel settings-section">
        <div className="settings-head">
          <h3>预览主题</h3>
          <p>作用于所有页面的 Markdown 渲染区域</p>
        </div>
        <div className="radio-cards">
          {THEMES.map((theme) => (
            <button
              key={theme.value}
              type="button"
              className={`radio-card${settings.theme === theme.value ? ' selected' : ''}`}
              onClick={() => { updateSettings({ theme: theme.value }); notify('预览主题已更新'); }}
            >
              <span className="radio-icon">{theme.icon}</span>
              <strong>{theme.label}</strong>
              <small>{theme.note}</small>
              <span className="radio-dot" />
            </button>
          ))}
        </div>
      </section>

      <section className="panel settings-section">
        <div className="settings-head">
          <h3>默认导出选项</h3>
          <p>决定预览中心「默认导出」主按钮的行为</p>
        </div>
        <div className="radio-cards">
          {EXPORTS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`radio-card${settings.defaultExport === option.value ? ' selected' : ''}`}
              onClick={() => { updateSettings({ defaultExport: option.value }); notify('默认导出方式已更新'); }}
            >
              <span className="radio-icon">{option.icon}</span>
              <strong>{option.label}</strong>
              <small>{option.note}</small>
              <span className="radio-dot" />
            </button>
          ))}
        </div>
      </section>

      <section className="panel settings-section">
        <div className="settings-head">
          <h3>转换历史</h3>
          <p>自动保留成功转换的结果，最多保留最近 100 条</p>
        </div>
        <label className="switch-row">
          <span>
            <strong>自动存入历史</strong>
            <small>关闭后仍可在预览中心手动「存入历史」</small>
          </span>
          <input
            type="checkbox"
            checked={settings.autoHistory}
            onChange={(event) => {
              updateSettings({ autoHistory: event.target.checked });
              notify(event.target.checked ? '已开启自动存历史' : '已关闭自动存历史');
            }}
          />
          <i className="switch-track" />
        </label>
      </section>

      <section className="panel settings-section">
        <div className="settings-head">
          <h3>本地数据管理</h3>
          <p>数据只存在于当前浏览器；导出为 JSON 便于备份</p>
        </div>
        <div className="toolbar wrap">
          <div className="toolbar-group">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => downloadText(
                'drop2md-backup.json',
                JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), items, history, settings }, null, 2),
                '本地数据已导出',
                'application/json;charset=utf-8',
              )}
            >
              ↓ 导出全部数据
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => { updateSettings(DEFAULT_SETTINGS); notify('设置已恢复默认'); }}
            >
              恢复默认设置
            </button>
          </div>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              if (window.confirm('确定清空本机队列与全部转换历史吗？此操作不可撤销。')) {
                clearQueue();
                clearHistory();
              }
            }}
          >
            清空本机数据
          </button>
        </div>
        <div className="data-summary">
          <span>队列 <b>{items.length}</b> 项</span>
          <span>历史 <b>{history.length}</b> 条</span>
          <span>主题 <b>{settings.theme === 'light' ? '亮色' : '暗色'}</b></span>
          <span>默认导出 <b>{settings.defaultExport === 'md' ? '下载 .md' : '复制内容'}</b></span>
        </div>
      </section>
    </main>
  );
}
