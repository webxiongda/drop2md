/** 应用外壳：hash 路由 + 顶部导航 + 全局品牌与提示条 */
import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import About from './pages/About';
import Batch from './pages/Batch';
import Convert from './pages/Convert';
import Examples from './pages/Examples';
import Formats from './pages/Formats';
import Guide from './pages/Guide';
import History from './pages/History';
import Preview from './pages/Preview';
import Queue from './pages/Queue';
import SettingsPage from './pages/Settings';
import { StoreProvider, useStore } from './store';
import { pageFromHash, PAGES } from './types';
import type { PageId } from './types';

const PAGE_COMPONENTS: Record<PageId, () => ReactElement> = {
  convert: Convert,
  queue: Queue,
  preview: Preview,
  formats: Formats,
  history: History,
  examples: Examples,
  batch: Batch,
  guide: Guide,
  about: About,
  settings: SettingsPage,
};

function useRoute(): PageId {
  const [page, setPage] = useState<PageId>(() => pageFromHash(window.location.hash));

  useEffect(() => {
    if (!window.location.hash || window.location.hash === '#') {
      window.history.replaceState(null, '', '#/convert');
    }
    const onChange = () => {
      setPage(pageFromHash(window.location.hash));
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return page;
}

function AppShell() {
  const page = useRoute();
  const { toast } = useStore();
  const Current = PAGE_COMPONENTS[page];
  const current = PAGES.find((item) => item.id === page) ?? PAGES[0];

  return (
    <div className="app-shell">
      <div className="privacy-strip">
        <span className="privacy-icon">◈</span>
        <strong>全部在本地浏览器完成，文件不会上传</strong>
        <span className="privacy-dot" />
        <span className="privacy-sub">零服务端 · 零追踪 · 打开即用</span>
      </div>

      <header className="masthead">
        <div className="brand">
          <div className="brand-mark"><span>M</span></div>
          <div className="brand-copy">
            <h1>Drop<span>2</span>MD</h1>
            <p>把任何文件，拖成干净的 Markdown</p>
          </div>
        </div>
        <div className="masthead-meta">
          <span className="pill">✦ 本地优先</span>
          <span className="pill ghost">v1.0</span>
        </div>
      </header>

      <nav className="nav-bar" aria-label="主导航">
        <div className="nav-scroll">
          {PAGES.map((item) => (
            <a
              key={item.id}
              href={item.path}
              className={`nav-link${page === item.id ? ' active' : ''}`}
              aria-current={page === item.id ? 'page' : undefined}
              title={item.hint}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              <span className="nav-short">{item.short}</span>
            </a>
          ))}
        </div>
      </nav>

      <div className="page-breadcrumb mono">
        <span>#/{page}</span>
        <span className="breadcrumb-hint">{current.hint}</span>
      </div>

      <Current />

      <footer className="footer">
        <span>Drop2MD · 纯前端 / 零上传</span>
        <span>Made for docs lovers ✦</span>
      </footer>

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}
