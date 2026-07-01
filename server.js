const { execFile } = require("child_process");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { URL } = require("url");
const { fetchTextToSpeechAudio, getTtsStatusCode } = require("./lib/tts");

const PORT = Number(process.env.PORT || 4174);
const ROOT = __dirname;
const STATIC_ROOT = path.join(ROOT, "public");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg"
};

const server = http.createServer(async (request, response) => {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  const requestUrl = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "POST" && requestUrl.pathname === "/api/refresh-document") {
    await handleRefreshDocument(request, response);
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/tts") {
    await handleTextToSpeech(requestUrl, response);
    return;
  }

  if (request.method === "GET") {
    serveStatic(requestUrl.pathname, response);
    return;
  }

  sendJson(response, 405, { ok: false, error: "Method not allowed" });
});

server.listen(PORT, () => {
  console.log(`English card app is running at http://localhost:${PORT}`);
});

async function handleRefreshDocument(request, response) {
  try {
    const body = await readJsonBody(request);
    const sourceUrl = normalizeDocumentUrl(body.sourceUrl);
    const validationError = getDocumentUrlError(sourceUrl);

    if (validationError) {
      sendJson(response, 400, { ok: false, error: validationError });
      return;
    }

    const result = await fetchFeishuDocument(sourceUrl);
    const document = parseFeishuDocument(result.content, {
      sourceUrl,
      documentId: result.documentId,
      revisionId: result.revisionId
    });

    sendJson(response, 200, { ok: true, document });
  } catch (error) {
    sendJson(response, 500, { ok: false, error: getSafeErrorMessage(error) });
  }
}

async function handleTextToSpeech(requestUrl, response) {
  try {
    const result = await fetchTextToSpeechAudio({
      text: requestUrl.searchParams.get("text"),
      lang: requestUrl.searchParams.get("lang")
    });

    response.writeHead(200, {
      "Content-Type": result.contentType,
      "Content-Length": result.buffer.length,
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
      "X-TTS-Provider": result.provider
    });
    response.end(result.buffer);
  } catch (error) {
    sendJson(response, getTtsStatusCode(error), { ok: false, error: getSafeErrorMessage(error) });
  }
}

function serveStatic(urlPathname, response) {
  const pathname = decodeURIComponent(urlPathname === "/" ? "/index.html" : urlPathname);
  const filePath = path.resolve(STATIC_ROOT, `.${pathname}`);

  if (!filePath.startsWith(STATIC_ROOT)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream"
    });
    response.end(content);
  });
}

function fetchFeishuDocument(sourceUrl) {
  if (process.env.FEISHU_APP_ID && process.env.FEISHU_APP_SECRET) {
    return fetchFeishuDocumentViaOpenApi(sourceUrl);
  }

  const larkCli = process.env.LARK_CLI || "lark-cli";
  const env = {
    ...process.env,
    PATH: `${process.env.HOME}/.local/bin:${process.env.PATH || ""}`
  };

  return new Promise((resolve, reject) => {
    execFile(
      larkCli,
      ["docs", "+fetch", "--api-version", "v2", "--doc", sourceUrl, "--doc-format", "markdown"],
      {
        env,
        maxBuffer: 1024 * 1024 * 10,
        timeout: 30000
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || stdout || error.message));
          return;
        }

        try {
          const payload = JSON.parse(stdout);
          if (!payload.ok) {
            reject(new Error(payload.error?.message || "飞书文档读取失败"));
            return;
          }

          resolve({
            content: payload.data.document.content,
            documentId: payload.data.document.document_id,
            revisionId: payload.data.document.revision_id
          });
        } catch (parseError) {
          reject(new Error(`飞书返回内容解析失败：${parseError.message}`));
        }
      }
    );
  });
}

async function fetchFeishuDocumentViaOpenApi(sourceUrl) {
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

async function getTenantAccessToken() {
  const payload = await callFeishuOpenApi("/auth/v3/tenant_access_token/internal", {
    method: "POST",
    body: {
      app_id: process.env.FEISHU_APP_ID,
      app_secret: process.env.FEISHU_APP_SECRET
    }
  });

  if (!payload.tenant_access_token) {
    throw new Error("飞书 tenant_access_token 获取失败");
  }

  return payload.tenant_access_token;
}

async function resolveDocxResource(resource, tenantAccessToken) {
  if (resource.type === "docx") {
    return { token: resource.token, title: "" };
  }

  if (resource.type !== "wiki") {
    throw new Error("生产部署当前仅支持 Wiki 链接或新版飞书文档 docx 链接。");
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

  return {
    token: node.obj_token,
    title: node.title || ""
  };
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
    throw new Error("旧版 docs 链接暂不支持生产部署读取，请使用新版 docx 或 Wiki 链接。");
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

function readJsonBody(request) {
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
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(JSON.stringify(payload));
}

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function getSafeErrorMessage(error) {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [redacted]");
}
