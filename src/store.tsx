/**
 * 跨页面共享状态：转换队列 / 历史 / 设置。
 * 全部写入 localStorage，读取时对损坏数据做容错降级。
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { convertFile, toMdName } from './converter';
import type { ConvertResult } from './converter';

export interface ConvertItem extends ConvertResult {
  id: string;
  name: string;
  size: number;
  targetName: string;
}

export interface HistoryEntry extends ConvertItem {
  createdAt: number;
}

export interface Settings {
  theme: 'light' | 'dark';
  defaultExport: 'md' | 'clipboard';
  autoHistory: boolean;
}
export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  defaultExport: 'md',
  autoHistory: true,
};

const KEY_ROOT = ['drop', '2', 'md'].join('');
const QUEUE_KEY = `${KEY_ROOT}.queue.v1`;
const HISTORY_KEY = `${KEY_ROOT}.history.v1`;
const SETTINGS_KEY = `${KEY_ROOT}.settings.v1`;
const HISTORY_LIMIT = 100;

/** Read localStorage and fall back when JSON is corrupted or storage is blocked. */
function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Silently degrade in private mode or when quota is exceeded. */
function writeStored(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 内存态仍可继续工作
  }
}

let sequence = 0;
export function nextId(): string {
  sequence += 1;
  return `f${Date.now().toString(36)}${sequence}`;
}

/** 刷新会中断异步转换：有产物视为完成，否则标记失败等待重加 */
function reviveQueue(raw: unknown): ConvertItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((row): row is ConvertItem => (
      !!row && typeof row === 'object' && typeof (row as ConvertItem).id === 'string'
    ))
    .map((row) => (
      row.status === 'converting'
        ? {
            ...row,
            status: row.markdown ? 'done' : 'error',
            message: row.markdown ? row.message : '刷新中断了转换，请重新添加该文件',
          }
        : row
    ));
}

function reviveHistory(raw: unknown): HistoryEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((row): row is HistoryEntry => (
    !!row && typeof row === 'object'
      && typeof (row as HistoryEntry).id === 'string'
      && typeof (row as HistoryEntry).markdown === 'string'
  ));
}

interface StoreValue {
  items: ConvertItem[];
  history: HistoryEntry[];
  settings: Settings;
  selectedId: string | null;
  selected: ConvertItem | null;
  doneItems: ConvertItem[];
  copiedId: string | null;
  toast: string | null;
  notify: (message: string) => void;
  addFiles: (files: File[]) => void;
  removeItem: (id: string) => void;
  renameItem: (id: string, targetName: string) => void;
  clearQueue: () => void;
  selectItem: (id: string) => void;
  copyText: (text: string, key?: string) => Promise<void>;
  downloadText: (name: string, content: string, message?: string, mime?: string) => void;
  downloadItems: (rows: ConvertItem[]) => void;
  saveToHistory: (item: ConvertItem) => void;
  removeHistory: (id: string) => void;
  clearHistory: () => void;
  loadFromHistory: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ConvertItem[]>(
    () => reviveQueue(readStored<unknown>(QUEUE_KEY, [])),
  );
  const [history, setHistory] = useState<HistoryEntry[]>(
    () => reviveHistory(readStored<unknown>(HISTORY_KEY, [])),
  );
  const [settings, setSettings] = useState<Settings>(() => {
    const loaded = readStored<Partial<Settings>>(SETTINGS_KEY, {});
    const safe = loaded && typeof loaded === 'object' ? loaded : {};
    return {
      theme: safe.theme === 'light' ? 'light' : 'dark',
      defaultExport: safe.defaultExport === 'clipboard' ? 'clipboard' : 'md',
      autoHistory: typeof safe.autoHistory === 'boolean' ? safe.autoHistory : true,
    };
  });
  const [selectedId, setSelectedId] = useState<string | null>(() => items[0]?.id ?? null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // 让异步转换完成时使用最新设置，而不是首次渲染的闭包值
  const settingsRef = useRef(settings);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  useEffect(() => { writeStored(QUEUE_KEY, items); }, [items]);
  useEffect(() => { writeStored(HISTORY_KEY, history); }, [history]);
  useEffect(() => { writeStored(SETTINGS_KEY, settings); }, [settings]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );
  const doneItems = useMemo(
    () => items.filter((item) => item.status === 'done' && item.markdown),
    [items],
  );

  const notify = useCallback((message: string) => setToast(message), []);

  const addFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;
    const created: ConvertItem[] = files.map((file) => ({
      id: nextId(),
      name: file.name,
      size: file.size,
      targetName: toMdName(file.name),
      status: 'converting',
      markdown: '',
    }));
    setItems((prev) => [...prev, ...created]);
    setSelectedId((prev) => prev ?? created[0].id);
    setToast(`已加入 ${files.length} 个文件，正在本地转换…`);
    created.forEach((item, index) => {
      void convertFile(files[index]).then((result) => {
        setItems((prev) => prev.map((row) => (
          row.id === item.id ? { ...row, ...result } : row
        )));
        // 自动历史直接落库，避免每条结果都弹出提示覆盖加入提示
        if (result.status === 'done' && result.markdown && settingsRef.current.autoHistory) {
          setHistory((prev) => [
            { ...item, ...result, id: nextId(), createdAt: Date.now() },
            ...prev,
          ].slice(0, HISTORY_LIMIT));
        }
      });
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  const renameItem = useCallback((id: string, targetName: string) => {
    const clean = targetName.trim() || 'untitled.md';
    setItems((prev) => prev.map((item) => (
      item.id === id ? { ...item, targetName: clean } : item
    )));
  }, []);

  const clearQueue = useCallback(() => {
    setItems([]);
    setSelectedId(null);
    setToast('转换队列已清空');
  }, []);

  const selectItem = useCallback((id: string) => setSelectedId(id), []);

  const copyText = useCallback(async (text: string, key?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(key ?? null);
      setToast('Markdown 已复制到剪贴板');
      if (key) {
        window.setTimeout(
          () => setCopiedId((current) => (current === key ? null : current)),
          1800,
        );
      }
    } catch {
      setToast('复制失败，请切换到「Markdown 源码」手动复制');
    }
  }, []);

  const downloadText = useCallback((
    name: string,
    content: string,
    message?: string,
    mime = 'text/markdown;charset=utf-8',
  ) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    if (message) setToast(message);
  }, []);

  const downloadItems = useCallback((rows: ConvertItem[]) => {
    const ready = rows.filter((row) => row.status === 'done' && row.markdown);
    if (ready.length === 0) {
      setToast('还没有可下载的结果');
      return;
    }
    ready.forEach((item, index) => {
      window.setTimeout(() => downloadText(item.targetName, item.markdown), index * 180);
    });
    setToast(`正在下载 ${ready.length} 个 Markdown 文件`);
  }, [downloadText]);

  const saveToHistory = useCallback((item: ConvertItem) => {
    if (!item.markdown) {
      setToast('该结果还没有可保存的内容');
      return;
    }
    setHistory((prev) => [
      { ...item, id: nextId(), createdAt: Date.now() },
      ...prev,
    ].slice(0, HISTORY_LIMIT));
    setToast('已保存到转换历史');
  }, []);

  const removeHistory = useCallback((id: string) => {
    setHistory((prev) => prev.filter((entry) => entry.id !== id));
    setToast('已从历史中删除');
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setToast('转换历史已清空');
  }, []);

  const loadFromHistory = useCallback((id: string) => {
    const entry = history.find((row) => row.id === id);
    if (!entry) return;
    const restored: ConvertItem = {
      id: nextId(),
      name: entry.name,
      size: entry.size,
      targetName: entry.targetName,
      status: entry.status,
      markdown: entry.markdown,
      message: entry.message,
    };
    setItems((prev) => [...prev, restored]);
    setSelectedId(restored.id);
    setToast(`已把「${entry.name}」加载回工作台`);
  }, [history]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = useMemo<StoreValue>(() => ({
    items,
    history,
    settings,
    selectedId,
    selected,
    doneItems,
    copiedId,
    toast,
    notify,
    addFiles,
    removeItem,
    renameItem,
    clearQueue,
    selectItem,
    copyText,
    downloadText,
    downloadItems,
    saveToHistory,
    removeHistory,
    clearHistory,
    loadFromHistory,
    updateSettings,
  }), [
    items, history, settings, selectedId, selected, doneItems, copiedId, toast, notify,
    addFiles, removeItem, renameItem, clearQueue, selectItem, copyText,
    downloadText, downloadItems, saveToHistory, removeHistory, clearHistory,
    loadFromHistory, updateSettings,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore 必须在 StoreProvider 内使用');
  return store;
}
