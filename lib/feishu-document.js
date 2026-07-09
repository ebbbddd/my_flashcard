function parseFeishuResource(sourceUrl) {
  const url = new URL(sourceUrl);
  const [, type, token] = url.pathname.split("/");

  if (!token) {
    throw new Error("飞书文档链接缺少 token。");
  }

  if (type === "wiki" || type === "docx") {
    return { type, token };
  }

  if (type === "docs") {
    throw new Error("旧版 docs 链接暂不支持，请使用新版 docx 或 Wiki 链接。");
  }

  throw new Error("请输入有效的飞书 Wiki 或新版文档链接。");
}

function parseFeishuDocument(content, meta) {
  const normalizedContent = normalizeFeishuContent(content);
  const title = getTitle(normalizedContent) || "飞书文档";
  const strippedContent = normalizedContent.replace(/<title>[\s\S]*?<\/title>/i, "");
  const bodyBlocks = getBodyBlocks(strippedContent);

  const cards = [];

  for (let index = 0; index < bodyBlocks.length; index += 1) {
    const block = bodyBlocks[index];
    const paragraph = block.text;
    if (!paragraph) continue;

    const nextBlock = bodyBlocks[index + 1];
    const nextParagraph = nextBlock?.text || "";
    if (!nextParagraph) continue;

    const paragraphHasChinese = hasChinese(paragraph);
    const nextHasChinese = hasChinese(nextParagraph);

    if (!paragraphHasChinese && nextHasChinese) {
      cards.push(createCard(cards.length, meta.documentId, paragraph, nextParagraph, block.headingPath));
      index += 1;
      continue;
    }

    if (paragraphHasChinese && !nextHasChinese) {
      cards.push(createCard(cards.length, meta.documentId, nextParagraph, paragraph, block.headingPath));
      index += 1;
    }
  }

  if (cards.length === 0) {
    throw new Error("没有解析到卡片。请确认文档按“英文段落 + 中文段落”或“中文段落 + 英文段落”成对编写。");
  }

  return {
    title,
    section: "正文",
    sourceUrl: meta.sourceUrl,
    documentId: meta.documentId,
    revisionId: meta.revisionId,
    cards
  };
}

function getBodyBlocks(content) {
  const headingStack = Array(5).fill("");
  const blocks = [];
  let paragraphLines = [];

  const flushParagraph = () => {
    const text = cleanupMarkdown(paragraphLines.join("\n"));
    paragraphLines = [];
    if (!text) return;

    blocks.push({
      text,
      headingPath: getHeadingPath(headingStack)
    });
  };

  for (const line of String(content || "").split("\n")) {
    const heading = parseHeadingLine(line);

    if (heading) {
      flushParagraph();
      updateHeadingStack(headingStack, heading);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      continue;
    }

    paragraphLines.push(line);
  }

  flushParagraph();
  return blocks;
}

function parseHeadingLine(line) {
  const markdownHeading = line.match(/^\s{0,3}(#{1,5})\s+(.+?)\s*#*\s*$/);
  if (markdownHeading) {
    return {
      level: markdownHeading[1].length,
      text: cleanupMarkdown(markdownHeading[2])
    };
  }

  const htmlHeading = line.match(/^\s*<h([1-5])\b[^>]*>([\s\S]*?)<\/h\1>\s*$/i);
  if (htmlHeading) {
    return {
      level: Number(htmlHeading[1]),
      text: cleanupMarkdown(htmlHeading[2])
    };
  }

  return null;
}

function updateHeadingStack(headingStack, heading) {
  const index = heading.level - 1;
  headingStack[index] = heading.text;
  headingStack.fill("", heading.level);
}

function getHeadingPath(headingStack) {
  return headingStack.filter(Boolean);
}

function createCard(index, documentId, en, zh, headingPath = []) {
  const paddedIndex = String(index + 1).padStart(3, "0");
  return {
    id: `${documentId}-${paddedIndex}`,
    en: cleanupMarkdown(en),
    zh: cleanupMarkdown(zh),
    headingPath
  };
}

function getTitle(content) {
  const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/i);
  if (titleMatch) return cleanupMarkdown(titleMatch[1]);

  const headingMatch = content.match(/^#\s+(.+)$/m);
  return headingMatch ? cleanupMarkdown(headingMatch[1]) : "";
}

function normalizeFeishuContent(value) {
  return String(value || "")
    .replace(/\\r\\n|\\n|\\r/g, "\n")
    .replace(/\\t/g, " ")
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\r\n?/g, "\n");
}

function cleanupMarkdown(value) {
  return normalizeFeishuContent(value)
    .replace(/<[^>]+>/g, "")
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/^\s*>+\s?/gm, "")
    .replace(/^\s*[-*+]\s+/, "")
    .replace(/^\s*\d+[.)]\s+/, "")
    .replace(/\\([\\`*_{}\[\]()#+\-.!|>])/g, "$1")
    .replace(/\\/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\s*\n\s*/g, " ")
    .trim();
}

function hasChinese(value) {
  return /[\u3400-\u9fff]/.test(value);
}

function normalizeDocumentUrl(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getDocumentUrlError(value) {
  if (!value) return "请输入飞书文档链接";

  try {
    const url = new URL(value);
    const isFeishuHost =
      url.hostname.endsWith("feishu.cn") ||
      url.hostname.endsWith("larksuite.com") ||
      url.hostname.endsWith("larkoffice.com");
    const isDocumentPath = /^\/(wiki|docx|docs)\//.test(url.pathname);

    if (!isFeishuHost || !isDocumentPath) {
      return "请输入有效的飞书 Wiki 或文档链接";
    }

    return "";
  } catch {
    return "链接格式不正确";
  }
}

module.exports = {
  cleanupMarkdown,
  getDocumentUrlError,
  normalizeDocumentUrl,
  normalizeFeishuContent,
  parseFeishuDocument,
  parseFeishuResource
};
