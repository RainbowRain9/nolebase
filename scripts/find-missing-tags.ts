// 扫描 docs 目录（或自定义目录）里 Markdown/Vue 文件的“未闭合标签 / 裸尖括号”问题
// 运行：pnpm tsx scripts/find-missing-tags.ts

import { readdirSync, readFileSync, statSync } from "fs";
import { join, extname } from "path";

const ROOTS = [
  join(process.cwd(), "docs"),
  join(process.cwd(), "笔记"), // 你的仓库有中文目录，这里也扫一下
];

const NEED_PAIR = [
  "ClientOnly", "Tabs", "Tab",
  "details", "summary",
  "template", "style", "script",
];

const VOID_HTML = new Set([
  "area","base","br","col","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"
]);

// 认为是“类型尖括号”的模式（会提示你用反引号包起来）：
const TYPE_ANGLE_PATTERNS = [
  /(^|[^`])\b(Array|Set|Map|Record)\s*<[^>\n]+>/g,         // Array<String>、Map<K,V> 等
  /(^|[^`])<\s*(UUID|String|Int|Number|Boolean)\s*>/g,     // <UUID>、<String> 等
];

type Finding = { file: string; line: number; msg: string; snippet: string };

function walk(dir: string, files: string[] = []) {
  let entries: string[] = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return files;
  }
  for (const name of entries) {
    const p = join(dir, name);
    let s: any;
    try { s = statSync(p); } catch { continue; }
    if (s.isDirectory()) walk(p, files);
    else if (/\.(md|vue)$/i.test(p)) files.push(p);
  }
  return files;
}

function stripCode(raw: string) {
  // 去掉围栏代码块 ```...``` 与 ~~~...~~~，避免误报
  let text = raw.replace(/```[\s\S]*?```/g, "");
  text = text.replace(/~~~[\s\S]*?~~~/g, "");
  // 去掉行内代码 `...`
  text = text.replace(/`[^`\n]+`/g, "");
  return text;
}

function approxLine(text: string, idx: number) {
  return text.slice(0, idx).split(/\r?\n/).length;
}

function collectFindings(file: string): Finding[] {
  const findings: Finding[] = [];
  let raw = "";
  try { raw = readFileSync(file, "utf8"); } catch { return findings; }

  const text = stripCode(raw);

  // 1) 类型尖括号提示
  for (const pat of TYPE_ANGLE_PATTERNS) {
    let m: RegExpExecArray | null;
    while ((m = pat.exec(text)) !== null) {
      const start = m.index + (m[1] ? m[1].length : 0);
      const line = approxLine(text, start);
      findings.push({
        file, line,
        msg: "类型尖括号建议用行内代码包起来，如 `Array<String>`。",
        snippet: text.slice(start, start + 120).split("\n")[0],
      });
    }
  }

  // 2) 未闭合注释
  const openComments = [...text.matchAll(/<!--/g)].length;
  const closeComments = [...text.matchAll(/-->/g)].length;
  if (openComments !== closeComments) {
    const loc = text.indexOf("<!--");
    findings.push({
      file, line: approxLine(text, Math.max(0, loc)),
      msg: "HTML 注释未闭合（<!-- ... -->）。",
      snippet: text.slice(Math.max(0, loc - 40), Math.max(0, loc) + 80).replace(/\n/g, " "),
    });
  }

  // 3) 容器类标签配对检查
  for (const tag of NEED_PAIR) {
    const open = [...text.matchAll(new RegExp(`<${tag}(\\s[^>]*)?>`, "g"))].length;
    const selfClose = [...text.matchAll(new RegExp(`<${tag}(\\s[^>]*)?\\s*/>`, "g"))].length;
    const close = [...text.matchAll(new RegExp(`</${tag}>`, "g"))].length;
    const effectiveOpen = open - selfClose;
    if (effectiveOpen !== close) {
      const pos = text.search(new RegExp(`<${tag}\\b|</${tag}>`));
      findings.push({
        file, line: approxLine(text, pos >= 0 ? pos : 0),
        msg: `容器标签 <${tag}> / </${tag}> 数量不匹配（open=${open}, selfClose=${selfClose}, close=${close}）。`,
        snippet: text.slice(Math.max(0, pos - 60), Math.max(0, pos) + 120).replace(/\n/g, " "),
      });
    }
  }

  // 4) 一般 HTML 标签配对（忽略 void、自闭合）
  //    仅匹配形如 <tag ...> 与 </tag>
  const openTagRe = /<([A-Za-z][A-Za-z0-9:-]*)(\s[^>]*?)?>/g;
  const closeTagRe = /<\/([A-Za-z][A-Za-z0-9:-]*)>/g;
  const selfCloseRe = /<([A-Za-z][A-Za-z0-9:-]*)(\s[^>]*?)?\/>/g;

  // 收集所有开/闭/自闭合出现位置
  const opens: { tag: string; idx: number }[] = [];
  const closes: { tag: string; idx: number }[] = [];
  const selfCloses: { tag: string; idx: number }[] = [];

  let m: RegExpExecArray | null;
  while ((m = openTagRe.exec(text)) !== null) {
    const tag = m[1];
    // 跳过 void 标签
    if (VOID_HTML.has(tag.toLowerCase())) continue;
    // 如果这是自闭合，等会儿单独处理
    opens.push({ tag, idx: m.index });
  }
  while ((m = closeTagRe.exec(text)) !== null) {
    closes.push({ tag: m[1], idx: m.index });
  }
  while ((m = selfCloseRe.exec(text)) !== null) {
    selfCloses.push({ tag: m[1], idx: m.index });
  }

  // 用栈近似匹配
  const stack: { tag: string; idx: number }[] = [];
  // 先把自闭合位置做个集合，避免压栈
  const selfAt = new Set(selfCloses.map(x => x.idx));
  for (const o of opens) {
    if (selfAt.has(o.idx)) continue;
    // 过滤掉明显是类型尖括号的“伪标签”（例如 <String> 出现在 Array<String> 中）
    if (/^(String|UUID|Boolean|Number|Int)$/i.test(o.tag)) {
      findings.push({
        file, line: approxLine(text, o.idx),
        msg: `检测到疑似“类型尖括号” <${o.tag}>，请用行内代码：\`<${o.tag}>\`。`,
        snippet: text.slice(o.idx, o.idx + 100).split("\n")[0],
      });
      continue;
    }
    stack.push(o);
  }
  for (const c of closes) {
    // 从栈里回溯匹配同名标签
    let matched = false;
    for (let i = stack.length - 1; i >= 0; i--) {
      if (stack[i].tag === c.tag) {
        stack.splice(i, 1);
        matched = true;
        break;
      }
    }
    if (!matched) {
      findings.push({
        file, line: approxLine(text, c.idx),
        msg: `发现多余的闭合标签 </${c.tag}>（没有对应的 <${c.tag}>）。`,
        snippet: text.slice(c.idx - 50, c.idx + 120).replace(/\n/g, " "),
      });
    }
  }

  // 栈里剩下的都是“没有闭合”的开标签
  for (const s of stack) {
    findings.push({
      file, line: approxLine(text, s.idx),
      msg: `开标签 <${s.tag}> 可能缺少闭合（</${s.tag}>）。若仅展示文本，请用反引号：\`<${s.tag}>\`。`,
      snippet: text.slice(s.idx - 50, s.idx + 120).replace(/\n/g, " "),
    });
  }

  return findings;
}

function main() {
  const files = new Set<string>();
  for (const r of ROOTS) walk(r, Array.from(files)).forEach(f => files.add(f));

  const all: Finding[] = [];
  for (const f of files) {
    all.push(...collectFindings(f));
  }

  if (!all.length) {
    console.log("✅ 没有发现明显的未闭合标签或危险尖括号。若仍报错，可能是在 .vue 文件或动态插值处。");
    process.exit(0);
  }

  // 按文件和行号排序输出
  all.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  let current = "";
  for (const it of all) {
    if (it.file !== current) {
      current = it.file;
      console.log("\n=== " + current + " ===");
    }
    console.log(`L${it.line}: ${it.msg}`);
    console.log(`  -> ${it.snippet}`);
  }

  // 给一个非零退出码，方便你在 CI 里看到失败
  process.exit(2);
}

main();
