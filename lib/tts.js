const MAX_TTS_TEXT_LENGTH = 800;
const PROVIDER_TIMEOUT_MS = 8000;
const REQUEST_HEADERS = {
  Accept: "audio/mpeg,audio/*;q=0.9,*/*;q=0.8",
  Referer: "https://fanyi.baidu.com/",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
};

async function fetchTextToSpeechAudio(options) {
  const text = normalizeTtsText(options?.text);
  const lang = normalizeTtsLang(options?.lang);
  const providers = buildProviderUrls(text, lang);
  const errors = [];

  for (const provider of providers) {
    try {
      const response = await fetchWithTimeout(provider.url);
      const contentType = response.headers.get("content-type") || "audio/mpeg";
      const buffer = Buffer.from(await response.arrayBuffer());

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      if (!buffer.length || /^text\/html/i.test(contentType)) {
        throw new Error(`unexpected content type ${contentType}`);
      }

      return {
        buffer,
        contentType: /^audio\//i.test(contentType) ? contentType : "audio/mpeg",
        provider: provider.name
      };
    } catch (error) {
      errors.push(`${provider.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw createTtsError(`TTS 音频生成失败，请稍后重试。${errors.length ? ` (${errors.join("; ")})` : ""}`, 502);
}

function normalizeTtsText(value) {
  const text = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";

  if (!text) {
    throw createTtsError("缺少朗读文本。", 400);
  }

  if (text.length > MAX_TTS_TEXT_LENGTH) {
    throw createTtsError(`朗读文本过长，请控制在 ${MAX_TTS_TEXT_LENGTH} 个字符以内。`, 400);
  }

  return text;
}

function normalizeTtsLang(value) {
  const lang = typeof value === "string" ? value.toLowerCase() : "";
  return lang.startsWith("en") ? "en-US" : "zh-CN";
}

function buildProviderUrls(text, lang) {
  const encodedText = encodeURIComponent(text);
  const isEnglish = lang.startsWith("en");
  const baiduLang = isEnglish ? "en" : "zh";
  const googleLang = isEnglish ? "en-US" : "zh-CN";

  return [
    {
      name: "baidu",
      url: `https://fanyi.baidu.com/gettts?lan=${baiduLang}&text=${encodedText}&spd=5&source=web`
    },
    {
      name: "youdao",
      url: `https://dict.youdao.com/dictvoice?audio=${encodedText}&type=${isEnglish ? "2" : "1"}`
    },
    {
      name: "google",
      url: `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${googleLang}&client=tw-ob`
    }
  ];
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

  try {
    return await fetch(url, {
      headers: REQUEST_HEADERS,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

function createTtsError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function getTtsStatusCode(error) {
  return Number.isInteger(error?.statusCode) ? error.statusCode : 500;
}

module.exports = {
  fetchTextToSpeechAudio,
  getTtsStatusCode
};
