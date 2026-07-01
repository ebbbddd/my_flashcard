const { readDocumentState, writeDocumentState } = require("../lib/documents-store");

module.exports = async function handler(request, response) {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  try {
    if (request.method === "GET") {
      const state = await readDocumentState();
      sendJson(response, 200, { ok: true, state });
      return;
    }

    if (request.method === "PUT") {
      const body = await readRequestBody(request);
      const state = await writeDocumentState(body);
      sendJson(response, 200, { ok: true, state });
      return;
    }

    sendJson(response, 405, { ok: false, error: "Method not allowed" });
  } catch (error) {
    sendJson(response, 500, { ok: false, error: getSafeErrorMessage(error) });
  }
};

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
  response.setHeader("Access-Control-Allow-Methods", "GET,PUT,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function getSafeErrorMessage(error) {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [redacted]");
}
