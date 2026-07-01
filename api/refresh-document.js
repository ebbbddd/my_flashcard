const { getDocumentUrlError, normalizeDocumentUrl, parseFeishuDocument, parseFeishuResource } = require("../lib/feishu-document");

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
