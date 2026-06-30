module.exports = async function handler(request, response) {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "POST") {
    sendJson(response, 405, { ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const body = await readRequestBody(request);
    const sourceUrl = normalizeDocumentUrl(body.sourceUrl);
    const validationError = getDocumentUrlError(sourceUrl);

    if (validationError) {
      sendJson(response, 400, { ok: false, error: validationError });
      return;
    }

    const result = await fetchFeishuDocumentViaOpenApi(sourceUrl);
    const document = parseFeishuDocument(result.content, {
      sourceUrl,
      documentId: result.documentId,
      revisionId: result.revisionId
    });

    sendJson(response, 200, { ok: true, document });
  } catch (error) {
    sendJson(response, 500, { ok: false, error: getSafeErrorMessage(error) });
  }
};

async function fetchFeishuDocumentViaOpenApi(sourceUrl) {
  assertFeishuEnv();

  const tenantAccessToken = await getTenantAccessToken();
  const resource = parseFeishuResource(sourceUrl);
  const docxResource = await resolveDocxResource(resource, tenantAccessToken);
  const query = new URLSearchParams({
    doc_token: docxResource.token,
    doc_type: "docx",
    content_type: "markdown"
  });
  const payload = await callFeishuOpenApi(`/docs/v1/content?${query.toString()}`, {
    token: tenantAccessToken
  });

  return {
    content: payload.data.content,
    documentId: docxResource.token,
    revisionId: null
  };
}

function assertFeishuEnv() {
  if (!process.env.FEISHU_APP_ID || !process.env.FEISHU_APP_SECRET) {
    throw new Error("Vercel 环境变量缺少 FEISHU_APP_ID 或 FEISHU_APP_SECRET。");
  }
}

async function getTenantAccessToken() {
  const payload = await callFeishuOpenApi("/auth/v3/tenant_access_token/internal", {
    method: "POST",
    body: {
      app_id: process.env.FEISHU_APP_ID,
      app_secret: process.env.FEISHU_APP_SECRET
    }
  });

  if (!payload.tenant_access_token) {
    throw new Error("飞书 tenant_access_token 获取失败。");
  }

  return payload.tenant_access_token;
}

async function resolveDocxResource(resource, tenantAccessToken) {
  if (resource.type === "docx") {
    return { token: resource.token };
  }

  if (resource.type !== "wiki") {
    throw new Error("当前仅支持 Wiki 链接或新版飞书文档 docx 链接。");
  }

  const query = new URLSearchParams({ token: resource.token });
  const payload = await callFeishuOpenApi(`/wiki/v2/spaces/get_node?${query.toString()}`, {
    token: tenantAccessToken
  });
  const node = payload.data?.node;

  if (!node?.obj_token || !node?.obj_type) {
    throw new Error("Wiki 节点解析失败，未拿到底层文档 token。");
  }

  if (node.obj_type !== "docx") {
    throw new Error(`当前仅支持 Wiki 节点指向新版文档 docx，当前类型为 ${node.obj_type}。`);
  }

  return { token: node.obj_token };
}

async function callFeishuOpenApi(endpoint, options = {}) {
  const openApiBase = process.env.FEISHU_OPEN_API_BASE || "https://open.feishu.cn/open-apis";
  const headers = {
    "Content-Type": "application/json; charset=utf-8"
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${openApiBase}${endpoint}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload || payload.code !== 0) {
    throw new Error(payload?.msg || `飞书 OpenAPI 调用失败：HTTP ${response.status}`);
  }

  return payload;
}

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
  const title = getTitle(content) || "飞书文档";
  const strippedContent = content.replace(/<title>[\s\S]*?<\/title>/i, "");
  const paragraphs = strippedContent
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  let currentSection = "全部";
  const cards = [];

  for (let index = 0; index < paragraphs.length; index += 1) {
    const paragraph = cleanupMarkdown(paragraphs[index]);
    if (!paragraph) continue;

    const heading = paragraph.match(/^#{1,6}\s+(.+)$/);
    if (heading) {
      currentSection = heading[1].trim();
      continue;
    }

    const nextParagraph = cleanupMarkdown(paragraphs[index + 1] || "");
    if (!nextParagraph || /^#{1,6}\s+/.test(nextParagraph)) continue;

    const paragraphHasChinese = hasChinese(paragraph);
    const nextHasChinese = hasChinese(nextParagraph);

    if (!paragraphHasChinese && nextHasChinese) {
      cards.push(createCard(cards.length, meta.documentId, paragraph, nextParagraph));
      index += 1;
      continue;
    }

    if (paragraphHasChinese && !nextHasChinese) {
      cards.push(createCard(cards.length, meta.documentId, nextParagraph, paragraph));
      index += 1;
    }
  }

  if (cards.length === 0) {
    throw new Error("没有解析到卡片。请确认文档按“英文段落 + 中文段落”或“中文段落 + 英文段落”成对编写。");
  }

  return {
    title,
    section: currentSection,
    sourceUrl: meta.sourceUrl,
    documentId: meta.documentId,
    revisionId: meta.revisionId,
    cards
  };
}

function createCard(index, documentId, en, zh) {
  const paddedIndex = String(index + 1).padStart(3, "0");
  return {
    id: `${documentId}-${paddedIndex}`,
    en,
    zh
  };
}

function getTitle(content) {
  const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/i);
  if (titleMatch) return cleanupMarkdown(titleMatch[1]);

  const headingMatch = content.match(/^#\s+(.+)$/m);
  return headingMatch ? cleanupMarkdown(headingMatch[1]) : "";
}

function cleanupMarkdown(value) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/^\s*[-*]\s+/, "")
    .replace(/\s+/g, " ")
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

async function readRequestBody(request) {
  if (request.body && typeof request.body === "object") {
    return request.body;
  }

  return new Promise((resolve, reject) => {
    let rawBody = "";

    request.on("data", (chunk) => {
      rawBody += chunk;
      if (rawBody.length > 1024 * 1024) {
        reject(new Error("请求内容过大"));
        request.destroy();
      }
    });

    request.on("end", () => {
      try {
        resolve(rawBody ? JSON.parse(rawBody) : {});
      } catch {
        reject(new Error("请求 JSON 格式不正确"));
      }
    });
  });
}

function sendJson(response, statusCode, payload) {
  response.status(statusCode).json(payload);
}

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function getSafeErrorMessage(error) {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [redacted]");
}
