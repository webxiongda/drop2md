/**
 * 极简 Markdown 渲染器（零依赖）。
 * 所有文本先做 HTML 转义，链接协议使用白名单，因此输出不含用户注入的脚本。
 */

/** HTML 特殊字符转义：任何来自文件的原始文本都不会变成可执行标签 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * 链接协议白名单：仅允许 http(s)、mailto、锚点与相对路径。
 * 去掉空白与控制字符后再判断，避免 `java\nscript:` 之类的绕过。
 */
function safeUrl(raw: string): string | null {
  const cleaned = raw.replace(/[\u0000-\u0020]/g, '').toLowerCase();
  if (
    cleaned === '' ||
    cleaned.startsWith('#') ||
    cleaned.startsWith('/') ||
    cleaned.startsWith('./') ||
    cleaned.startsWith('../') ||
    /^[a-z]:[\\/]/i.test(cleaned) ||
    /^(https?:|mailto:)/.test(cleaned)
  ) {
    return raw;
  }
  return null;
}

/** 粗体与斜体：只处理普通文本，不触碰已被占位符保护的链接与代码 */
function renderEmphasis(html: string): string {
  return html
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/(^|[^_])_([^_]+)_/g, '$1<em>$2</em>');
}

/**
 * 行内标记：先抽出代码/图片/链接到占位符，再处理强调标记，最后还原。
 * 这样 URL 中的 _ 或 * 不会被误解析成强调语法。
 */
function renderInline(source: string): string {
  let html = escapeHtml(source);
  const codeSpans: string[] = [];
  const mediaSpans: string[] = [];
  const linkSpans: string[] = [];

  html = html.replace(/`([^`]+)`/g, (_match, body: string) => {
    codeSpans.push(`<code>${body}</code>`);
    return `\u0000c${codeSpans.length - 1}\u0000`;
  });

  html = html.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
    (_match, alt: string, url: string) => {
      const href = safeUrl(url);
      mediaSpans.push(href ? `<img src="${href}" alt="${alt}" loading="lazy" />` : alt);
      return `\u0000i${mediaSpans.length - 1}\u0000`;
    },
  );

  html = html.replace(
    /\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
    (_match, label: string, url: string) => {
      const href = safeUrl(url);
      const text = renderEmphasis(label);
      linkSpans.push(
        href
          ? `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
          : text,
      );
      return `\u0000l${linkSpans.length - 1}\u0000`;
    },
  );

  html = renderEmphasis(html);
  html = html.replace(/\u0000([cil])(\d+)\u0000/g, (_match, kind: string, index: string) => {
    const pool = kind === 'c' ? codeSpans : kind === 'i' ? mediaSpans : linkSpans;
    return pool[Number(index)] ?? '';
  });
  return html;
}

/** 表格行拆分，保留转义后的 \| 供单元格还原 */
function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

/** Markdown → HTML 字符串，仅生成受控标签 */
export function renderMarkdown(input: string): string {
  const lines = input.replace(/\r\n?/g, '\n').split('\n');
  const out: string[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      out.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    const fence = line.match(/^\s*```\s*([\w+#.-]*)\s*$/);
    if (fence) {
      flushParagraph();
      const lang = fence[1] || 'text';
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1; // consume the closing fence
      out.push(
        `<pre class="code-block"><div class="code-lang">${escapeHtml(lang)}</div><code>${escapeHtml(code.join('\n'))}</code></pre>`,
      );
      continue;
    }

    if (/^\s*$/.test(line)) {
      flushParagraph();
      i += 1;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      const level = heading[1].length;
      out.push(`<h${level}>${renderInline(heading[2].trim())}</h${level}>`);
      i += 1;
      continue;
    }

    if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      flushParagraph();
      out.push('<hr />');
      i += 1;
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      flushParagraph();
      const quoted: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        quoted.push(lines[i].replace(/^\s*>\s?/, ''));
        i += 1;
      }
      out.push(`<blockquote>${renderInline(quoted.join(' '))}</blockquote>`);
      continue;
    }

    // Table: current line is a header row, next line is the delimiter row.
    const delimiter = lines[i + 1] ?? '';
    if (
      /^\s*\|.*\|\s*$/.test(line) &&
      /^\s*\|?[\s:|-]+\|?\s*$/.test(delimiter) &&
      delimiter.includes('-')
    ) {
      flushParagraph();
      const head = splitTableRow(line);
      i += 2;
      const body: string[][] = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        body.push(splitTableRow(lines[i]));
        i += 1;
      }
      const headHtml = head
        .map((cell) => `<th>${renderInline(cell.replace(/\\\|/g, '|'))}</th>`)
        .join('');
      const bodyHtml = body
        .map(
          (row) =>
            `<tr>${row.map((cell) => `<td>${renderInline(cell.replace(/\\\|/g, '|'))}</td>`).join('')}</tr>`,
        )
        .join('');
      out.push(
        `<div class="table-wrap"><table><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`,
      );
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      flushParagraph();
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(`<li>${renderInline(lines[i].replace(/^\s*[-*+]\s+/, ''))}</li>`);
        i += 1;
      }
      out.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      flushParagraph();
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(`<li>${renderInline(lines[i].replace(/^\s*\d+\.\s+/, ''))}</li>`);
        i += 1;
      }
      out.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    paragraph.push(line.trim());
    i += 1;
  }
  flushParagraph();

  return out.join('\n');
}
