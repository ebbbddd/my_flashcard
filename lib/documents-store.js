const fs = require("fs/promises");
const os = require("os");
const path = require("path");

const STORE_KEY = process.env.DOCUMENTS_STORE_KEY || "english-flashcards:documents";
const EMPTY_STATE = {
  documents: [],
  deletedDocumentIds: [],
  favorites: [],
  deletedFavoriteKeys: [],
  updatedAt: null
};

async function readDocumentState() {
  if (hasRedisStore()) {
    const result = await callRedis(["GET", STORE_KEY]);
    if (!result) return { ...EMPTY_STATE };

    try {
      return normalizeDocumentState(JSON.parse(result));
    } catch {
      return { ...EMPTY_STATE };
    }
  }

  try {
    const raw = await fs.readFile(getFileStorePath(), "utf8");
    return normalizeDocumentState(JSON.parse(raw));
  } catch {
    return { ...EMPTY_STATE };
  }
}

async function writeDocumentState(input) {
  const state = normalizeDocumentState({
    ...input,
    updatedAt: new Date().toISOString()
  });

  if (hasRedisStore()) {
    await callRedis(["SET", STORE_KEY, JSON.stringify(state)]);
    return state;
  }

  const filePath = getFileStorePath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(state, null, 2));
  return state;
}

function normalizeDocumentState(input = {}) {
  const documents = Array.isArray(input.documents) ? input.documents.map(sanitizeDocument).filter(Boolean) : [];
  const deletedDocumentIds = Array.isArray(input.deletedDocumentIds)
    ? [...new Set(input.deletedDocumentIds.filter((id) => typeof id === "string" && id))]
    : [];
  const favorites = Array.isArray(input.favorites) ? input.favorites.map(sanitizeFavorite).filter(Boolean) : [];
  const deletedFavoriteKeys = Array.isArray(input.deletedFavoriteKeys)
    ? [...new Set(input.deletedFavoriteKeys.filter((key) => typeof key === "string" && key))]
    : [];

  return {
    documents,
    deletedDocumentIds,
    favorites,
    deletedFavoriteKeys,
    updatedAt: typeof input.updatedAt === "string" ? input.updatedAt : null
  };
}

function sanitizeDocument(doc) {
  if (
    !doc ||
    typeof doc.id !== "string" ||
    typeof doc.title !== "string" ||
    typeof doc.sourceUrl !== "string" ||
    !Array.isArray(doc.cards)
  ) {
    return null;
  }

  const cards = doc.cards.map(sanitizeCard).filter(Boolean);
  if (cards.length === 0) return null;

  return {
    id: doc.id,
    title: doc.title,
    section: typeof doc.section === "string" ? doc.section : "全部",
    sourceUrl: doc.sourceUrl,
    isCustom: Boolean(doc.isCustom),
    documentId: typeof doc.documentId === "string" ? doc.documentId : undefined,
    revisionId: typeof doc.revisionId === "string" ? doc.revisionId : null,
    updatedAt: typeof doc.updatedAt === "string" ? doc.updatedAt : "",
    cards
  };
}

function sanitizeCard(card) {
  if (!card || typeof card.id !== "string" || typeof card.en !== "string" || typeof card.zh !== "string") {
    return null;
  }

  return {
    id: card.id,
    en: card.en,
    zh: card.zh,
    headingPath: normalizeHeadingPath(card.headingPath)
  };
}

function normalizeHeadingPath(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim());
}

function sanitizeFavorite(value) {
  if (!value || typeof value.key !== "string" || typeof value.zh !== "string" || typeof value.en !== "string") {
    return null;
  }

  return {
    id: typeof value.id === "string" && value.id ? value.id : "",
    key: value.key,
    sourceDocumentId: typeof value.sourceDocumentId === "string" ? value.sourceDocumentId : "",
    sourceTitle: typeof value.sourceTitle === "string" ? value.sourceTitle : "飞书文档",
    sourceSection: typeof value.sourceSection === "string" ? value.sourceSection : "",
    sourceUrl: typeof value.sourceUrl === "string" ? value.sourceUrl : "",
    sourceCardId: typeof value.sourceCardId === "string" ? value.sourceCardId : "",
    zh: value.zh,
    en: value.en,
    headingPath: normalizeHeadingPath(value.headingPath),
    savedAt: typeof value.savedAt === "string" ? value.savedAt : ""
  };
}

async function callRedis(command) {
  const response = await fetch(getRedisUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getRedisToken()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command)
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload || payload.error) {
    throw new Error(payload?.error || `共享数据存储调用失败：HTTP ${response.status}`);
  }

  return payload.result;
}

function hasRedisStore() {
  return Boolean(getRedisUrl() && getRedisToken());
}

function getRedisUrl() {
  return process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.VERCEL_KV_REST_API_URL || "";
}

function getRedisToken() {
  return process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.VERCEL_KV_REST_API_TOKEN || "";
}

function getFileStorePath() {
  if (process.env.DOCUMENTS_STORE_FILE) return process.env.DOCUMENTS_STORE_FILE;
  if (process.env.VERCEL) return path.join(os.tmpdir(), "english-flashcards-documents.json");
  return path.join(process.cwd(), "data", "documents.json");
}

module.exports = {
  normalizeDocumentState,
  readDocumentState,
  writeDocumentState
};
