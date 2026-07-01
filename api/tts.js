const { fetchTextToSpeechAudio, getTtsStatusCode } = require("../lib/tts");

module.exports = async function handler(request, response) {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "GET") {
    sendJson(response, 405, { ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const requestUrl = new URL(request.url, `http://${request.headers.host || "localhost"}`);
    const result = await fetchTextToSpeechAudio({
      text: requestUrl.searchParams.get("text"),
      lang: requestUrl.searchParams.get("lang")
    });

    response.setHeader("Content-Type", result.contentType);
    response.setHeader("Content-Length", result.buffer.length);
    response.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800");
    response.setHeader("X-TTS-Provider", result.provider);
    response.status(200).send(result.buffer);
  } catch (error) {
    sendJson(response, getTtsStatusCode(error), { ok: false, error: getSafeErrorMessage(error) });
  }
};

function sendJson(response, statusCode, payload) {
  response.status(statusCode).json(payload);
}

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function getSafeErrorMessage(error) {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [redacted]");
}
