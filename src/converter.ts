/**
 * 文件 → Markdown 转换核心。
 * 所有逻辑都在浏览器内完成，不含任何网络请求。
 */

export type ConvertStatus = 'converting' | 'done' | 'binary' | 'error';

export interface ConvertResult {
  markdown: string;
  status: ConvertStatus;
  message?: string;
}

// Common extensions mapped to a fenced-code language hint.
const LANGUAGE_BY_EXT: Record<string, string> = {
  js: 'javascript', mjs: 'javascript', cjs: 'javascript', jsx: 'jsx',
  ts: 'typescript', mts: 'typescript', cts: 'typescript', tsx: 'tsx',
  py: 'python', rb: 'ruby', php: 'php', go: 'go', rs: 'rust',
  java: 'java', kt: 'kotlin', swift: 'swift', c: 'c', h: 'c',
  cpp: 'cpp', cc: 'cpp', cs: 'csharp', css: 'css', scss: 'scss',
  less: 'less', sh: 'bash', bash: 'bash', zsh: 'bash', ps1: 'powershell',
  yml: 'yaml', yaml: 'yaml', xml: 'xml', svg: 'xml', sql: 'sql',
  toml: 'toml', ini: 'ini', dockerfile: 'dockerfile',
};

/** 把任意文件名映射为同名的 .md 文件名 */
export function toMdName(name: string): string {
  const base = name.replace(/\.[^./\\]+$/, '') || name;
  return `${base}.md`;
}

/** 人类可读的文件大小 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * 二进制探测：NUL 字节、异常比例的控制字符、非法 UTF-8 都视为二进制。
 * 末尾 3 字节不参与 UTF-8 校验，避免多字节字符被切片截断导致误判。
 */
function looksBinary(bytes: Uint8Array): boolean {
  if (bytes.length === 0) return false;
  let controls = 0;
  for (let i = 0; i < bytes.length; i += 1) {
    const b = bytes[i];
    if (b === 0) return true;
    if (b < 32 && b !== 9 && b !== 10 && b !== 13 && b !== 12 && b !== 8) controls += 1;
  }
  if (controls / bytes.length > 0.1) return true;
  try {
    const safe = bytes.length > 4 ? bytes.subarray(0, bytes.length - 3) : bytes;
    new TextDecoder('utf-8', { fatal: true }).decode(safe);
  } catch {
    return true;
  }
  return false;
}

/* ------------------------------------------------------------------ */
/* HTML → Markdown                                                      */
/* ------------------------------------------------------------------ */

/** 行内元素转换：链接、粗体、斜体、行内代码、图片都以白名单方式处理 */
function inlineText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent ?? '').replace(/\s+/g, ' ');
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const el = node as Element;
  const tag = el.tagName.toLowerCase();
  if (tag === 'script' || tag === 'style') return '';

  // Recurse first, then wrap with the corresponding Markdown marker.
  const inner = Array.from(el.childNodes).map(inlineText).join('');
  switch (tag) {
    case 'a':
      return `[${inner.trim()}](${el.getAttribute('href') ?? ''})`;
    case 'strong':
    case 'b':
      return `**${inner}**`;
    case 'em':
    case 'i':
      return `*${inner}*`;
    case 'code':
      return '`' + inner.replace(/`/g, '\\`') + '`';
    case 'br':
      return ' ';
    case 'img':
      return `![${el.getAttribute('alt') ?? ''}](${el.getAttribute('src') ?? ''})`;
    default:
      return inner;
  }
}

/** 块级元素转换：标题、段落、列表、代码块、引用、分割线、表格 */
function htmlBlockToLines(node: Node, indent: number): string[] {
  const pad = '  '.repeat(indent);
  const out: string[] = [];

  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (text) out.push(pad + text);
    return out;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return out;

  const el = node as Element;
  const tag = el.tagName.toLowerCase();
  if (tag === 'script' || tag === 'style' || tag === 'noscript' || tag === 'svg') return out;

  if (/^h[1-6]$/.test(tag)) {
    out.push(pad + '#'.repeat(Number(tag[1])) + ' ' + inlineText(el).trim());
    return out;
  }

  if (tag === 'p') {
    const text = inlineText(el).trim();
    if (text) out.push(pad + text);
    return out;
  }

  if (tag === 'pre') {
    const codeEl = el.querySelector('code');
    const target = codeEl ?? el;
    const cls = target.getAttribute('class') ?? '';
    const match = cls.match(/language-([\w+#.-]+)/);
    const lang = match ? match[1] : '';
    out.push(pad + '```' + lang);
    (target.textContent ?? '')
      .replace(/\r\n?/g, '\n')
      .replace(/\n$/, '')
      .split('\n')
      .forEach((line) => out.push(line));
    out.push(pad + '```');
    return out;
  }

  if (tag === 'ul' || tag === 'ol') {
    const ordered = tag === 'ol';
    let index = Number(el.getAttribute('start') ?? '1') || 1;
    Array.from(el.children).forEach((li) => {
      if (li.tagName.toLowerCase() !== 'li') return;
      const marker = ordered ? `${index}. ` : '- ';
      if (ordered) index += 1;

      const own: string[] = [];
      Array.from(li.childNodes).forEach((child) => {
        const childTag = child.nodeType === Node.ELEMENT_NODE
          ? (child as Element).tagName.toLowerCase()
          : '';
        if (childTag === 'ul' || childTag === 'ol') return; // nested list handled below
        own.push(...htmlBlockToLines(child, 0));
      });
      const first = own.shift() ?? '';
      out.push(pad + marker + first);
      own.forEach((line) => out.push(pad + '  ' + line));
      Array.from(li.children).forEach((child) => {
        const childTag = child.tagName.toLowerCase();
        if (childTag === 'ul' || childTag === 'ol') {
          out.push(...htmlBlockToLines(child, indent + 1));
        }
      });
    });
    return out;
  }

  if (tag === 'blockquote') {
    const inner: string[] = [];
    Array.from(el.childNodes).forEach((child) => inner.push(...htmlBlockToLines(child, 0)));
    inner.forEach((line) => out.push(pad + '> ' + line));
    return out;
  }

  if (tag === 'hr') {
    out.push(pad + '---');
    return out;
  }

  if (tag === 'table') {
    const rows = Array.from(el.querySelectorAll('tr')).map((tr) =>
      Array.from(tr.children).map((cell) => inlineText(cell).replace(/\|/g, '\\|').trim()),
    );
    if (rows.length) {
      const head = rows[0];
      out.push(pad + '| ' + head.join(' | ') + ' |');
      out.push(pad + '| ' + head.map(() => '---').join(' | ') + ' |');
      rows.slice(1).forEach((row) => out.push(pad + '| ' + row.join(' | ') + ' |'));
    }
    return out;
  }

  Array.from(el.childNodes).forEach((child) => out.push(...htmlBlockToLines(child, indent)));
  return out;
}

/** HTML 字符串 → Markdown 字符串 */
export function htmlToMarkdown(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const root: Node = doc.body ?? doc.documentElement;
  return htmlBlockToLines(root, 0).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/* ------------------------------------------------------------------ */
/* CSV → Markdown table                                                 */
/* ------------------------------------------------------------------ */

/** 支持引号包裹、转义引号 ""、字段内分隔符与换行的 CSV 解析器 */
export function parseDelimited(input: string, delimiter = ','): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  const text = input.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  // 输入末尾没有换行时补一次 flush，否则最后一行会被丢掉
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ''));
}

/** CSV/TSV → Markdown 表格，第一行作为表头 */
export function csvToMarkdown(input: string, delimiter = ','): string {
  const rows = parseDelimited(input, delimiter);
  if (!rows.length) return '_（表格为空）_';

  const width = Math.max(...rows.map((r) => r.length));
  const normalized = rows.map((r) => {
    const padded = r.slice();
    while (padded.length < width) padded.push('');
    return padded.map((value) => value.replace(/\|/g, '\\|').replace(/\n/g, '<br>').trim());
  });
  const head = normalized[0];
  const lines = [
    '| ' + head.join(' | ') + ' |',
    '| ' + head.map(() => '---').join(' | ') + ' |',
    ...normalized.slice(1).map((r) => '| ' + r.join(' | ') + ' |'),
  ];
  return lines.join('\n');
}

/* ------------------------------------------------------------------ */
/* JSON → fenced block                                                  */
/* ------------------------------------------------------------------ */

/** 格式化 JSON 并包成 ```json 代码块；解析失败时原样保留便于排查 */
export function jsonToMarkdown(input: string, lineDelimited = false): string {
  try {
    let formatted: string;
    if (lineDelimited) {
      formatted = input
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => JSON.stringify(JSON.parse(line), null, 2))
        .join('\n');
    } else {
      formatted = JSON.stringify(JSON.parse(input), null, 2);
    }
    return '```json\n' + formatted + '\n```';
  } catch {
    return '```json\n' + input.trim() + '\n```';
  }
}

/* ------------------------------------------------------------------ */
/* Dispatcher                                                           */
/* ------------------------------------------------------------------ */

const BINARY_HINT =
  '这是一个二进制文件，无法安全转换为 Markdown。请提供文本类文件（.md / .txt / .html / .csv / .json 等）。';

/** 主入口：按扩展名分派；文件读取全程在浏览器内完成 */
export async function convertFile(file: File): Promise<ConvertResult> {
  const dot = file.name.lastIndexOf('.');
  const ext = dot >= 0 ? file.name.slice(dot + 1).toLowerCase() : '';
  const head = new Uint8Array(await file.slice(0, 4096).arrayBuffer());

  const plainText = ext === 'md' || ext === 'txt' || ext === 'log';
  if (!plainText && looksBinary(head)) {
    return { markdown: '', status: 'binary', message: BINARY_HINT };
  }

  try {
    if (plainText) {
      return { markdown: (await file.text()).replace(/\r\n?/g, '\n'), status: 'done' };
    }
    if (ext === 'html' || ext === 'htm') {
      return { markdown: htmlToMarkdown(await file.text()), status: 'done' };
    }
    if (ext === 'csv' || ext === 'tsv') {
      return {
        markdown: csvToMarkdown(await file.text(), ext === 'tsv' ? '\t' : ','),
        status: 'done',
      };
    }
    if (ext === 'json' || ext === 'jsonl' || ext === 'ndjson') {
      return {
        markdown: jsonToMarkdown(await file.text(), ext !== 'json'),
        status: 'done',
      };
    }

    // 其他文本类统一包成带语言提示的代码块
    const text = (await file.text()).replace(/\r\n?/g, '\n').replace(/\n$/, '');
    const lang = LANGUAGE_BY_EXT[ext] ?? ext ?? 'text';
    return { markdown: '```' + lang + '\n' + text + '\n```', status: 'done' };
  } catch (error) {
    return {
      markdown: '',
      status: 'error',
      message: `读取失败：${error instanceof Error ? error.message : '未知错误'}`,
    };
  }
}
