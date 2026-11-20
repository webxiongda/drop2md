/** 内置示例：点击即构造 File 对象，走和真实拖拽完全相同的转换流程 */

export interface SampleDef {
  id: string;
  label: string;
  description: string;
  badge: string;
  tone: string;
  name: string;
  content: string;
}

const HTML_SAMPLE = `<article>
  <h1>Nebula 1.0 发布说明</h1>
  <p>我们很高兴宣布 <strong>Nebula 1.0</strong> 正式发布。这是一个<em>完全本地</em>的文档工具。</p>
  <h2>新特性</h2>
  <ul>
    <li>拖拽即转，支持 <a href="https://example.com/docs">批量处理</a></li>
    <li>内置 Markdown 实时预览</li>
    <li>零上传，隐私优先</li>
    <li>支持嵌套列表
      <ul>
        <li>子项：自动识别层级</li>
      </ul>
    </li>
  </ul>
  <h2>快速开始</h2>
  <pre><code class="language-bash">npm install
npm run dev</code></pre>
  <blockquote>所有转换都在你的浏览器中完成，不会经过任何服务器。</blockquote>
  <hr />
  <p>更多信息请访问 <a href="https://example.com">项目主页</a>。</p>
</article>`;

const CSV_SAMPLE = `地区,产品,季度,销售额,备注
华东,"Alpha Pro","Q1","¥128,400","增长 12%"
华南,"Alpha Pro,Q2",Q2,96500,"含""特别""订单"
华北,Beta,Q3,73200,
西部,"Gamma LT",Q4,51800,"需要跟进"`;

const JSON_SAMPLE = `{"name":"drop2md","version":"1.0.0","private":true,"features":["拖拽转换","本地预览","隐私优先"],"settings":{"theme":"dark","accent":"#34d399","maxFileSizeMB":10},"author":{"name":"Open Source","url":"https://github.com"}}`;

export const SAMPLES: SampleDef[] = [
  {
    id: 'html',
    label: 'HTML 片段',
    description: '标题 / 列表 / 链接 / 代码',
    badge: '</>',
    tone: 'orange',
    name: '发布说明.html',
    content: HTML_SAMPLE,
  },
  {
    id: 'csv',
    label: 'CSV 表格',
    description: '带引号与逗号转义',
    badge: 'TBL',
    tone: 'blue',
    name: '季度销售数据.csv',
    content: CSV_SAMPLE,
  },
  {
    id: 'json',
    label: 'JSON 配置',
    description: '自动格式化缩进',
    badge: '{}',
    tone: 'purple',
    name: '配置文件.json',
    content: JSON_SAMPLE,
  },
];

/** Create a browser-native File so samples reuse the real conversion path. */
export function sampleToFile(sample: SampleDef): File {
  return new File([sample.content], sample.name, { type: 'text/plain;charset=utf-8' });
}
