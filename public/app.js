const seedDocuments = [
  {
    id: "J0fAd7mtKomoIUxPOvOmJnYvysh",
    title: "7月学习",
    section: "01",
    sourceUrl: "https://bytedance.larkoffice.com/wiki/N60rwuySCiUHCikE2PFcOo5Jnwc",
    cards: [
      {
        id: "J0fAd7mtKomoIUxPOvOmJnYvysh-01-001",
        en: "When I first heard this, I was so confused too!",
        zh: "我第一次听到这件事的时候，也一头雾水！"
      },
      {
        id: "J0fAd7mtKomoIUxPOvOmJnYvysh-01-002",
        en: "When I was still a child, my father developed my sense of direction.",
        zh: "我小时候，父亲培养了我的方向感。"
      },
      {
        id: "J0fAd7mtKomoIUxPOvOmJnYvysh-01-003",
        en: "And now as an adult, I trust my ability to navigate space.",
        zh: "如今长大成人，我相信自己辨别方位的能力。"
      },
      {
        id: "J0fAd7mtKomoIUxPOvOmJnYvysh-01-004",
        en: "My father helped give me confidence, To guide myself through the world.",
        zh: "是父亲赋予我底气，让我能独自闯荡世间。"
      },
      {
        id: "J0fAd7mtKomoIUxPOvOmJnYvysh-01-005",
        en: "The phrase \"sense of direction\", can refer to your knack for finding your way around, but it can also mean a feeling of purpose in life and in what you do.",
        zh: "短语“sense of direction”，可以指认路识途的本事，但它也可以指代人生与行事的目标感。"
      },
      {
        id: "J0fAd7mtKomoIUxPOvOmJnYvysh-01-006",
        en: "And if you want to say \"you've gotten lost or disoriented \", you can use the phrase \"lose your bearings\".",
        zh: "如果你想表达“迷路、分不清方向”，可以用短语“lose your bearings”。"
      },
      {
        id: "J0fAd7mtKomoIUxPOvOmJnYvysh-01-007",
        en: "You can also pair “sense of” with an abstract noun, to express some inner feeling, awareness or quality.",
        zh: "你也可以把 sense of 搭配抽象名词，用来表达某种内心感受、认知或是特质。"
      },
      {
        id: "J0fAd7mtKomoIUxPOvOmJnYvysh-01-008",
        en: "The phrase, as an adult, refers to the time after you've grown up or to a fully grown person.",
        zh: "短语 as an adult，指成年之后的阶段，或是已经长大成人的人。"
      },
      {
        id: "J0fAd7mtKomoIUxPOvOmJnYvysh-01-009",
        en: "You can also use this phrase to express the same idea. The phrase is someone's ability to do something simply.",
        zh: "你也可以用这个短语表达相同含义。这个短语指代某人轻松做好某事的能力。"
      },
      {
        id: "J0fAd7mtKomoIUxPOvOmJnYvysh-01-010",
        en: "And if you want to say someone has a real talent, you can use the phrase have a knack for it.",
        zh: "如果你想说某人天赋过人，可以用短语 have a knack for it。"
      },
      {
        id: "J0fAd7mtKomoIUxPOvOmJnYvysh-01-011",
        en: "The word navigate means to find your way.",
        zh: "单词 navigate 的本意是辨别路线、找路。"
      },
      {
        id: "J0fAd7mtKomoIUxPOvOmJnYvysh-01-012",
        en: "It can also mean handling something skillfully, to feel your way through a tricky situation and sort things out.",
        zh: "它也可以指熟练应对各类事务，在复杂困境中摸索前行、理清头绪。"
      },
      {
        id: "J0fAd7mtKomoIUxPOvOmJnYvysh-01-013",
        en: "The word confidence is all about believing.",
        zh: "单词 confidence 核心含义是自信、相信自己。"
      },
      {
        id: "J0fAd7mtKomoIUxPOvOmJnYvysh-01-014",
        en: "Self-assurance carries the exact same meaning.",
        zh: "Self-assurance 和它词义完全一致。"
      },
      {
        id: "J0fAd7mtKomoIUxPOvOmJnYvysh-01-015",
        en: "The phrase \"guide someone through something\" means to lead someone through a difficult situation step by step, emphasizing guided support.",
        zh: "短语“guide someone through something”指一步步带领他人渡过难关，侧重全程陪伴、悉心指引。"
      },
      {
        id: "J0fAd7mtKomoIUxPOvOmJnYvysh-01-016",
        en: "If you want to say you're teaching someone the basics or showing them how something works, you can use the phrase \"show someone the ropes\".",
        zh: "如果你想表达教别人基础操作、讲解事物运作方式，可以使用短语“show someone the ropes”。"
      }
    ]
  }
];

const STORAGE_KEY = "feishu-flashcard-documents";
const DELETED_DOCUMENTS_KEY = "feishu-flashcard-deleted-document-ids";
const FAVORITES_STORAGE_KEY = "feishu-flashcard-favorites";
const DELETED_FAVORITES_KEY = "feishu-flashcard-deleted-favorite-keys";
const FAVORITES_DOCUMENT_ID = "__favorites__";
const LONG_PRESS_DELAY = 650;
const SYNC_WRITE_DELAY = 250;

const state = {
  documentId: null,
  cardIndex: 0,
  isFlipped: false
};

const speechState = {
  activeUtterance: null,
  activeAudio: null,
  isSpeaking: false
};

const homeRefreshState = {
  documentIds: new Set()
};

const deleteState = {
  documentId: null,
  longPressTimer: null,
  longPressTriggered: false
};

const syncState = {
  writeTimer: null,
  isApplyingRemoteState: false,
  isManualSyncing: false
};

let documents = loadDocuments();
let favorites = loadFavorites();

const homeView = document.querySelector("#home-view");
const studyView = document.querySelector("#study-view");
const documentList = document.querySelector("#document-list");
const addDocumentButton = document.querySelector("#add-document-button");
const syncButton = document.querySelector("#sync-button");
const addDocumentDialog = document.querySelector("#add-document-dialog");
const addDocumentForm = document.querySelector("#add-document-form");
const closeDialogButton = document.querySelector("#close-dialog-button");
const cancelDialogButton = document.querySelector("#cancel-dialog-button");
const deleteDocumentDialog = document.querySelector("#delete-document-dialog");
const deleteDocumentForm = document.querySelector("#delete-document-form");
const deleteDocumentMessage = document.querySelector("#delete-document-message");
const cancelDeleteDocumentButton = document.querySelector("#cancel-delete-document-button");
const documentUrlInput = document.querySelector("#document-url-input");
const documentFormError = document.querySelector("#document-form-error");
const backButton = document.querySelector("#back-button");
const cardButton = document.querySelector("#card-button");
const flipButton = document.querySelector("#flip-button");
const speakButton = document.querySelector("#speak-button");
const favoriteButton = document.querySelector("#favorite-button");
const prevButton = document.querySelector("#prev-button");
const nextButton = document.querySelector("#next-button");
const studyTitle = document.querySelector("#study-title");
const studySection = document.querySelector("#study-section");
const progressButton = document.querySelector("#progress-button");
const cardJumpMenu = document.querySelector("#card-jump-menu");
const cardFrontText = document.querySelector("#card-front-text");
const cardBackText = document.querySelector("#card-back-text");

function loadDocuments() {
  return buildDocumentsFromCache(readCachedDocuments(), loadDeletedDocumentIds());
}

function readCachedDocuments() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isCachedDocument) : [];
  } catch {
    return [];
  }
}

function buildDocumentsFromCache(cachedDocuments, deletedIds) {
  const stored = Array.isArray(cachedDocuments) ? cachedDocuments.filter(isCachedDocument) : [];

  const seedDocumentsWithCache = seedDocuments
    .filter((seedDocument) => !deletedIds.has(seedDocument.id))
    .map((seedDocument) => {
      const cachedDocument = stored.find((doc) => doc.id === seedDocument.id);
      return cachedDocument ? { ...seedDocument, ...cachedDocument, isCustom: false } : seedDocument;
    });
  const customDocuments = stored.filter((doc) => {
    return doc.isCustom && !deletedIds.has(doc.id) && !seedDocuments.some((seedDocument) => seedDocument.id === doc.id);
  });

  return [...seedDocumentsWithCache, ...customDocuments];
}

function saveDocuments(options = {}) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents.filter(isCachedDocument)));
  if (options.sync !== false) queueSharedDocumentsSave();
}

function loadDeletedDocumentIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(DELETED_DOCUMENTS_KEY) ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : []);
  } catch {
    return new Set();
  }
}

function saveDeletedDocumentIds(deletedIds, options = {}) {
  localStorage.setItem(DELETED_DOCUMENTS_KEY, JSON.stringify([...deletedIds]));
  if (options.sync !== false) queueSharedDocumentsSave();
}

function loadFavorites() {
  try {
    const parsed = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];

    const deduped = new Map();
    for (const item of parsed) {
      const favorite = normalizeFavorite(item);
      if (favorite) deduped.set(favorite.key, favorite);
    }

    return [...deduped.values()];
  } catch {
    return [];
  }
}

function saveFavorites() {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  queueSharedDocumentsSave();
}

function loadDeletedFavoriteKeys() {
  try {
    const parsed = JSON.parse(localStorage.getItem(DELETED_FAVORITES_KEY) ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter((key) => typeof key === "string") : []);
  } catch {
    return new Set();
  }
}

function saveDeletedFavoriteKeys(deletedKeys, options = {}) {
  localStorage.setItem(DELETED_FAVORITES_KEY, JSON.stringify([...deletedKeys]));
  if (options.sync !== false) queueSharedDocumentsSave();
}

async function syncDocumentsFromServer(options = {}) {
  if (!canUseSharedApi()) return false;

  try {
    const remoteState = await requestSharedDocuments("GET");
    const localCachedDocuments = readCachedDocuments();
    const localDeletedIds = loadDeletedDocumentIds();
    const localFavorites = loadFavorites();
    const localDeletedFavoriteKeys = loadDeletedFavoriteKeys();
    const remoteDeletedIds = new Set(remoteState.deletedDocumentIds);
    const remoteDeletedFavoriteKeys = new Set(remoteState.deletedFavoriteKeys);
    const mergedDeletedIds = new Set([...remoteDeletedIds, ...localDeletedIds]);
    const mergedDeletedFavoriteKeys = new Set([...remoteDeletedFavoriteKeys, ...localDeletedFavoriteKeys]);
    const remoteIsEmpty =
      remoteState.documents.length === 0 &&
      remoteDeletedIds.size === 0 &&
      remoteState.favorites.length === 0 &&
      remoteDeletedFavoriteKeys.size === 0;
    const mergedCachedDocuments = mergeCachedDocuments(localCachedDocuments, remoteState.documents, mergedDeletedIds);
    const mergedFavorites = mergeFavorites(localFavorites, remoteState.favorites, mergedDeletedFavoriteKeys);
    const shouldPushMergedState =
      options.pushMerged === true ||
      (remoteIsEmpty && (localCachedDocuments.length > 0 || mergedDeletedIds.size > 0)) ||
      (remoteIsEmpty && (localFavorites.length > 0 || mergedDeletedFavoriteKeys.size > 0)) ||
      !areSharedStatesEquivalent(remoteState, {
        documents: mergedCachedDocuments,
        deletedDocumentIds: [...mergedDeletedIds],
        favorites: mergedFavorites,
        deletedFavoriteKeys: [...mergedDeletedFavoriteKeys]
      });

    syncState.isApplyingRemoteState = true;
    documents = buildDocumentsFromCache(mergedCachedDocuments, mergedDeletedIds);
    favorites = mergedFavorites;
    saveDeletedDocumentIds(mergedDeletedIds, { sync: false });
    saveDeletedFavoriteKeys(mergedDeletedFavoriteKeys, { sync: false });
    saveDocuments({ sync: false });
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    syncState.isApplyingRemoteState = false;

    if (state.documentId === FAVORITES_DOCUMENT_ID && favorites.length === 0) {
      goHome();
    } else if (state.documentId && state.documentId !== FAVORITES_DOCUMENT_ID && !documents.some((doc) => doc.id === state.documentId)) {
      goHome();
    } else if (studyView.classList.contains("is-active")) {
      renderStudy();
    }

    renderHome();

    if (shouldPushMergedState) {
      await saveDocumentsToServer();
    }
    return true;
  } catch (error) {
    syncState.isApplyingRemoteState = false;
    console.warn("Shared document sync failed:", error);
    return false;
  }
}

function queueSharedDocumentsSave() {
  if (!canUseSharedApi() || syncState.isApplyingRemoteState) return;

  window.clearTimeout(syncState.writeTimer);
  syncState.writeTimer = window.setTimeout(() => {
    syncState.writeTimer = null;
    saveDocumentsToServer().catch((error) => {
      console.warn("Shared document save failed:", error);
    });
  }, SYNC_WRITE_DELAY);
}

async function saveDocumentsToServer() {
  if (!canUseSharedApi()) return;

  await requestSharedDocuments("PUT", {
    documents: documents.filter(isCachedDocument),
    deletedDocumentIds: [...loadDeletedDocumentIds()],
    favorites,
    deletedFavoriteKeys: [...loadDeletedFavoriteKeys()]
  });
}

async function requestSharedDocuments(method, body) {
  const response = await fetch(`${getApiBase()}/api/documents`, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "共享数据同步失败");
  }

  return normalizeSharedDocumentState(payload.state);
}

function normalizeSharedDocumentState(value = {}) {
  return {
    documents: Array.isArray(value.documents) ? value.documents.filter(isCachedDocument) : [],
    deletedDocumentIds: Array.isArray(value.deletedDocumentIds)
      ? value.deletedDocumentIds.filter((id) => typeof id === "string" && id)
      : [],
    favorites: Array.isArray(value.favorites) ? value.favorites.map(normalizeFavorite).filter(Boolean) : [],
    deletedFavoriteKeys: Array.isArray(value.deletedFavoriteKeys)
      ? value.deletedFavoriteKeys.filter((key) => typeof key === "string" && key)
      : []
  };
}

function mergeCachedDocuments(fallbackDocuments, preferredDocuments, deletedIds) {
  const merged = new Map();

  for (const doc of fallbackDocuments) {
    if (!deletedIds.has(doc.id)) merged.set(doc.id, normalizeDocumentForSync(doc));
  }

  for (const doc of preferredDocuments) {
    if (deletedIds.has(doc.id)) continue;

    const nextDocument = normalizeDocumentForSync(doc);
    const existingDocument = merged.get(doc.id);
    merged.set(doc.id, chooseNewerSyncItem(existingDocument, nextDocument, "updatedAt"));
  }

  return [...merged.values()];
}

function mergeFavorites(fallbackFavorites, preferredFavorites, deletedFavoriteKeys) {
  const merged = new Map();

  for (const favorite of fallbackFavorites) {
    if (!deletedFavoriteKeys.has(favorite.key)) merged.set(favorite.key, favorite);
  }

  for (const favorite of preferredFavorites) {
    if (deletedFavoriteKeys.has(favorite.key)) continue;

    const existingFavorite = merged.get(favorite.key);
    merged.set(favorite.key, chooseNewerSyncItem(existingFavorite, favorite, "savedAt"));
  }

  return [...merged.values()].sort((a, b) => getTimeValue(b.savedAt) - getTimeValue(a.savedAt));
}

function chooseNewerSyncItem(existingItem, nextItem, timestampKey) {
  if (!existingItem) return nextItem;

  const existingTime = getTimeValue(existingItem[timestampKey]);
  const nextTime = getTimeValue(nextItem[timestampKey]);
  return nextTime >= existingTime ? nextItem : existingItem;
}

function getTimeValue(value) {
  const time = Date.parse(value || "");
  return Number.isNaN(time) ? 0 : time;
}

function normalizeDocumentForSync(doc) {
  return {
    ...doc,
    updatedAt: typeof doc.updatedAt === "string" ? doc.updatedAt : ""
  };
}

function areSharedStatesEquivalent(left, right) {
  return getSharedStateSignature(left) === getSharedStateSignature(right);
}

function getSharedStateSignature(stateToSign) {
  const deletedDocumentIds = [...new Set(stateToSign.deletedDocumentIds || [])].sort();
  const documentsToSign = (stateToSign.documents || [])
    .filter(isCachedDocument)
    .map((doc) => ({
      id: doc.id,
      title: doc.title,
      section: doc.section,
      sourceUrl: doc.sourceUrl,
      isCustom: Boolean(doc.isCustom),
      documentId: doc.documentId || "",
      revisionId: doc.revisionId || "",
      updatedAt: doc.updatedAt || "",
      cards: doc.cards
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
  const favoritesToSign = (stateToSign.favorites || [])
    .map(normalizeFavorite)
    .filter(Boolean)
    .map((favorite) => ({
      key: favorite.key,
      sourceDocumentId: favorite.sourceDocumentId,
      sourceTitle: favorite.sourceTitle,
      sourceSection: favorite.sourceSection,
      sourceUrl: favorite.sourceUrl,
      sourceCardId: favorite.sourceCardId,
      zh: favorite.zh,
      en: favorite.en,
      headingPath: favorite.headingPath,
      savedAt: favorite.savedAt
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
  const deletedFavoriteKeys = [...new Set(stateToSign.deletedFavoriteKeys || [])].sort();

  return JSON.stringify({ documents: documentsToSign, deletedDocumentIds, favorites: favoritesToSign, deletedFavoriteKeys });
}

function canUseSharedApi() {
  return window.location.protocol === "http:" || window.location.protocol === "https:" || window.location.protocol === "file:";
}

function isCachedDocument(doc) {
  return Boolean(
    doc &&
      typeof doc.id === "string" &&
      typeof doc.title === "string" &&
      typeof doc.sourceUrl === "string" &&
      Array.isArray(doc.cards)
  );
}

function getActiveDocument() {
  if (state.documentId === FAVORITES_DOCUMENT_ID) return getFavoritesDocument();
  return documents.find((document) => document.id === state.documentId) ?? documents[0];
}

function getActiveCard() {
  const document = getActiveDocument();
  return document.cards[state.cardIndex];
}

function renderHome() {
  documentList.replaceChildren(
    createFavoritesRow(),
    ...documents.map((doc) => {
      const item = document.createElement("div");
      item.className = "document-row";
      item.dataset.documentId = doc.id;
      item.classList.toggle("is-refreshing", homeRefreshState.documentIds.has(doc.id));

      const button = document.createElement("button");
      button.className = "document-card";
      button.type = "button";
      button.dataset.documentId = doc.id;

      const title = document.createElement("span");
      title.className = "document-title";
      title.textContent = doc.title;

      const meta = document.createElement("span");
      meta.className = "document-meta";

      const section = document.createElement("span");
      section.className = "meta-chip";
      section.textContent = doc.section;

      const count = document.createElement("span");
      count.textContent = `${doc.cards.length} 张卡片`;

      const source = document.createElement("span");
      source.className = "document-source";
      source.textContent = doc.sourceUrl;

      meta.append(section, count);
      button.append(title, meta, source);
      button.addEventListener("click", (event) => handleDocumentClick(event, doc.id));
      button.addEventListener("pointerdown", (event) => startDocumentLongPress(event, doc.id));
      button.addEventListener("pointerup", clearDocumentLongPress);
      button.addEventListener("pointerleave", clearDocumentLongPress);
      button.addEventListener("pointercancel", clearDocumentLongPress);
      button.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        clearDocumentLongPress();
        openDeleteDocumentDialog(doc.id);
      });

      const refresh = document.createElement("button");
      refresh.className = "document-refresh-button";
      refresh.type = "button";
      refresh.title = "刷新飞书文档";
      refresh.setAttribute("aria-label", `刷新 ${doc.title}`);
      refresh.disabled = homeRefreshState.documentIds.has(doc.id);
      refresh.addEventListener("click", () => refreshHomeDocument(doc.id));

      item.append(button, refresh);
      return item;
    })
  );
}

function createFavoritesRow() {
  const item = document.createElement("div");
  item.className = "document-row favorite-row";

  const button = document.createElement("button");
  button.className = "document-card";
  button.type = "button";

  const title = document.createElement("span");
  title.className = "document-title";
  title.textContent = "我的收藏";

  button.append(title);
  button.addEventListener("click", openFavorites);
  item.append(button);
  return item;
}

function handleDocumentClick(event, documentId) {
  if (deleteState.longPressTriggered) {
    event.preventDefault();
    deleteState.longPressTriggered = false;
    return;
  }

  openDocument(documentId);
}

function openFavorites() {
  if (favorites.length === 0) {
    alert("还没有收藏卡片。");
    return;
  }

  stopSpeech({ render: false });
  state.documentId = FAVORITES_DOCUMENT_ID;
  state.cardIndex = 0;
  state.isFlipped = false;
  setView("study");
  renderStudy();
}

function startDocumentLongPress(event, documentId) {
  if (event.button !== 0 && event.pointerType === "mouse") return;

  clearDocumentLongPress();
  deleteState.longPressTriggered = false;
  deleteState.longPressTimer = window.setTimeout(() => {
    deleteState.longPressTimer = null;
    deleteState.longPressTriggered = true;
    openDeleteDocumentDialog(documentId);
  }, LONG_PRESS_DELAY);
}

function clearDocumentLongPress() {
  if (!deleteState.longPressTimer) return;

  window.clearTimeout(deleteState.longPressTimer);
  deleteState.longPressTimer = null;
}

function openAddDocumentDialog() {
  documentFormError.textContent = "";
  addDocumentForm.reset();
  addDocumentDialog.showModal();
  requestAnimationFrame(() => documentUrlInput.focus());
}

function closeAddDocumentDialog() {
  addDocumentDialog.close();
}

function openDeleteDocumentDialog(documentId) {
  const documentToDelete = documents.find((doc) => doc.id === documentId);
  if (!documentToDelete) return;

  deleteState.documentId = documentId;
  deleteDocumentMessage.textContent = `确认删除“${documentToDelete.title}”？`;
  if (!deleteDocumentDialog.open) {
    deleteDocumentDialog.showModal();
  }
  requestAnimationFrame(() => cancelDeleteDocumentButton.focus());
}

function closeDeleteDocumentDialog() {
  deleteState.documentId = null;
  deleteDocumentDialog.close();
}

function handleDeleteDocument(event) {
  event.preventDefault();

  const documentId = deleteState.documentId;
  if (!documentId) return;

  const deletedIds = loadDeletedDocumentIds();
  deletedIds.add(documentId);
  saveDeletedDocumentIds(deletedIds, { sync: false });

  homeRefreshState.documentIds.delete(documentId);
  documents = documents.filter((doc) => doc.id !== documentId);

  if (state.documentId === documentId) {
    goHome();
  }

  saveDocuments();
  renderHome();
  closeDeleteDocumentDialog();
}

function handleAddDocument(event) {
  event.preventDefault();
  const sourceUrl = normalizeDocumentUrl(documentUrlInput.value);
  const validationError = getDocumentUrlError(sourceUrl);

  if (validationError) {
    documentFormError.textContent = validationError;
    documentUrlInput.focus();
    return;
  }

  const existingDocument = documents.find((doc) => doc.sourceUrl === sourceUrl);
  if (existingDocument) {
    closeAddDocumentDialog();
    openDocument(existingDocument.id);
    return;
  }

  const customDocument = createCustomDocument(sourceUrl);
  documents = [...documents, customDocument];
  saveDocuments();
  renderHome();
  closeAddDocumentDialog();
  openDocument(customDocument.id);
}

function normalizeDocumentUrl(value) {
  return value.trim();
}

function getDocumentUrlError(value) {
  if (!value) return "请输入飞书文档链接";

  try {
    const url = new URL(value);
    const isFeishuHost = url.hostname.endsWith("feishu.cn") || url.hostname.endsWith("larksuite.com") || url.hostname.endsWith("larkoffice.com");
    const isDocumentPath = /^\/(wiki|docx|docs)\//.test(url.pathname);

    if (!isFeishuHost || !isDocumentPath) {
      return "请输入有效的飞书 Wiki 或文档链接";
    }

    return "";
  } catch {
    return "链接格式不正确";
  }
}

function createCustomDocument(sourceUrl) {
  const token = sourceUrl.split("/").filter(Boolean).at(-1) ?? "";
  const shortToken = token.slice(0, 8) || String(Date.now()).slice(-8);
  const id = `custom-${Date.now()}`;

  return {
    id,
    title: `飞书文档 ${documents.filter((doc) => doc.isCustom).length + 1}`,
    section: "待解析",
    sourceUrl,
    isCustom: true,
    updatedAt: getNowIso(),
    cards: [
      {
        id: `${id}-pending`,
        zh: `已添加文档 ${shortToken}，等待读取内容。`,
        en: "The document has been added. The next backend step will load its content into cards."
      }
    ]
  };
}

function renderStudy() {
  const document = getActiveDocument();
  const card = getActiveCard();
  const cardCount = document.cards.length;
  const displayIndex = String(state.cardIndex + 1).padStart(2, "0");

  studyTitle.textContent = document.title;
  studySection.textContent = document.isFavorites ? card.sourceTitle || "收藏" : document.section;
  progressButton.textContent = `${displayIndex} / ${cardCount}`;
  cardFrontText.textContent = card.zh;
  cardBackText.textContent = card.en;
  cardButton.classList.toggle("is-flipped", state.isFlipped);
  flipButton.textContent = state.isFlipped ? "看中文" : "看英文";
  prevButton.disabled = state.cardIndex === 0;
  nextButton.disabled = state.cardIndex === cardCount - 1;
  renderSpeechButton();
  renderFavoriteButton();
  renderCardJumpMenu();
}

async function requestDocumentRefresh(sourceUrl) {
  const response = await fetch(`${getApiBase()}/api/refresh-document`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ sourceUrl })
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    const detail = payload?.error || "刷新失败，请确认本地服务已启动，并且飞书文档有访问权限。";
    throw new Error(detail);
  }

  return payload.document;
}

async function refreshHomeDocument(documentId) {
  const documentToRefresh = documents.find((doc) => doc.id === documentId);
  if (!documentToRefresh || homeRefreshState.documentIds.has(documentId)) return;

  homeRefreshState.documentIds.add(documentId);
  renderHome();

  try {
    const nextDocument = await refreshDocument(documentToRefresh);
    documents = documents.map((doc) => (doc.id === documentId ? nextDocument : doc));
    saveDocuments();

    if (state.documentId === documentId) {
      state.cardIndex = 0;
      state.isFlipped = false;
      renderStudy();
    }
  } catch (error) {
    alert(error.message);
  } finally {
    homeRefreshState.documentIds.delete(documentId);
    renderHome();
  }
}

async function refreshDocument(documentToRefresh) {
  const refreshedDocument = await requestDocumentRefresh(documentToRefresh.sourceUrl);

  return {
    ...documentToRefresh,
    title: refreshedDocument.title,
    section: refreshedDocument.section,
    sourceUrl: documentToRefresh.sourceUrl,
    documentId: refreshedDocument.documentId,
    revisionId: refreshedDocument.revisionId,
    updatedAt: getNowIso(),
    cards: refreshedDocument.cards
  };
}

function setView(viewName) {
  homeView.classList.toggle("is-active", viewName === "home");
  studyView.classList.toggle("is-active", viewName === "study");
  if (viewName !== "study") {
    stopSpeech({ render: false });
    closeCardJumpMenu();
  }
}

function openDocument(documentId) {
  stopSpeech({ render: false });
  state.documentId = documentId;
  state.cardIndex = 0;
  state.isFlipped = false;
  setView("study");
  renderStudy();
}

function goHome() {
  stopSpeech({ render: false });
  state.documentId = null;
  state.cardIndex = 0;
  state.isFlipped = false;
  setView("home");
}

function flipCard() {
  stopSpeech({ render: false });
  state.isFlipped = !state.isFlipped;
  renderStudy();
}

function goToCard(nextIndex) {
  const document = getActiveDocument();
  stopSpeech({ render: false });
  state.cardIndex = Math.max(0, Math.min(nextIndex, document.cards.length - 1));
  state.isFlipped = false;
  closeCardJumpMenu();
  renderStudy();
}

function renderCardJumpMenu() {
  const activeDocument = getActiveDocument();
  const items = [];
  let previousHeadingLabel = "";

  activeDocument.cards.forEach((card, index) => {
    const headingLabel = getCardHeadingLabel(card);
    if (headingLabel && headingLabel !== previousHeadingLabel) {
      const heading = document.createElement("div");
      heading.className = "jump-heading";
      heading.role = "presentation";
      heading.textContent = headingLabel;
      items.push(heading);
    }

    previousHeadingLabel = headingLabel;
    items.push(createJumpOption(card, index));
  });

  cardJumpMenu.replaceChildren(...items);
}

function createJumpOption(card, index) {
  const option = document.createElement("button");
  option.className = "jump-option";
  option.classList.toggle("is-active", index === state.cardIndex);
  option.type = "button";
  option.role = "option";
  option.setAttribute("aria-selected", String(index === state.cardIndex));

  const number = document.createElement("span");
  number.className = "jump-number";
  number.textContent = `${index + 1}.`;

  const text = document.createElement("span");
  text.className = "jump-text";
  text.textContent = card.zh;

  option.append(number, text);
  option.addEventListener("click", () => goToCard(index));
  return option;
}

function getCardHeadingLabel(card) {
  if (!Array.isArray(card.headingPath)) return "";
  return normalizeHeadingPath(card.headingPath).join(" - ");
}

function toggleCardJumpMenu() {
  const shouldOpen = !cardJumpMenu.classList.contains("is-open");
  cardJumpMenu.classList.toggle("is-open", shouldOpen);
  progressButton.setAttribute("aria-expanded", String(shouldOpen));
}

function closeCardJumpMenu() {
  cardJumpMenu.classList.remove("is-open");
  progressButton.setAttribute("aria-expanded", "false");
}

function renderFavoriteButton() {
  const document = getActiveDocument();
  const card = getActiveCard();
  const isFavorited = isCardFavorited(document, card);

  favoriteButton.classList.toggle("is-favorited", isFavorited);
  favoriteButton.textContent = "";
  favoriteButton.setAttribute("aria-label", isFavorited ? "取消收藏当前卡片" : "收藏当前卡片");
  favoriteButton.title = isFavorited ? "取消收藏当前卡片" : "收藏当前卡片";
  favoriteButton.setAttribute("aria-pressed", String(isFavorited));
}

function toggleFavorite() {
  const document = getActiveDocument();
  const card = getActiveCard();
  const favoriteKey = getCardFavoriteKey(document, card);
  const favoriteIndex = favorites.findIndex((item) => item.key === favoriteKey);
  const wasInFavoritesView = document.id === FAVORITES_DOCUMENT_ID;

  if (favoriteIndex >= 0) {
    const deletedFavoriteKeys = loadDeletedFavoriteKeys();
    deletedFavoriteKeys.add(favoriteKey);
    saveDeletedFavoriteKeys(deletedFavoriteKeys, { sync: false });
    favorites = favorites.filter((item) => item.key !== favoriteKey);
  } else {
    const deletedFavoriteKeys = loadDeletedFavoriteKeys();
    deletedFavoriteKeys.delete(favoriteKey);
    saveDeletedFavoriteKeys(deletedFavoriteKeys, { sync: false });
    favorites = [createFavoriteFromCard(document, card), ...favorites];
  }

  saveFavorites();
  renderHome();

  if (wasInFavoritesView && favoriteIndex >= 0) {
    stopSpeech({ render: false });

    if (favorites.length === 0) {
      goHome();
      return;
    }

    state.cardIndex = Math.min(state.cardIndex, favorites.length - 1);
    state.isFlipped = false;
  }

  renderStudy();
}

function isCardFavorited(documentToCheck, card) {
  if (!card) return false;
  const favoriteKey = getCardFavoriteKey(documentToCheck, card);
  return favorites.some((item) => item.key === favoriteKey);
}

function createFavoriteFromCard(sourceDocument, card) {
  const key = getCardFavoriteKey(sourceDocument, card);
  return {
    id: `favorite-${hashString(key)}`,
    key,
    sourceDocumentId: sourceDocument.isFavorites ? card.sourceDocumentId || "" : sourceDocument.id,
    sourceTitle: sourceDocument.isFavorites ? card.sourceTitle || "我的收藏" : sourceDocument.title,
    sourceSection: sourceDocument.isFavorites ? card.sourceSection || "" : sourceDocument.section,
    sourceUrl: sourceDocument.isFavorites ? card.sourceUrl || "" : sourceDocument.sourceUrl,
    sourceCardId: card.sourceCardId || card.id || "",
    zh: card.zh,
    en: card.en,
    headingPath: normalizeHeadingPath(card.headingPath),
    savedAt: new Date().toISOString()
  };
}

function getFavoritesDocument() {
  return {
    id: FAVORITES_DOCUMENT_ID,
    title: "我的收藏",
    section: "Favorites",
    sourceUrl: "local://favorites",
    isFavorites: true,
    cards: favorites.map((favorite) => ({
      id: favorite.id,
      favoriteKey: favorite.key,
      sourceDocumentId: favorite.sourceDocumentId,
      sourceTitle: favorite.sourceTitle,
      sourceSection: favorite.sourceSection,
      sourceUrl: favorite.sourceUrl,
      sourceCardId: favorite.sourceCardId,
      zh: favorite.zh,
      en: favorite.en,
      headingPath: favorite.headingPath
    }))
  };
}

function getCardFavoriteKey(sourceDocument, card) {
  if (card.favoriteKey) return card.favoriteKey;

  return [
    sourceDocument.sourceUrl || sourceDocument.id || "",
    normalizeFavoriteText(card.zh),
    normalizeFavoriteText(card.en)
  ].join("||");
}

function normalizeFavorite(value) {
  if (
    !value ||
    typeof value.key !== "string" ||
    typeof value.zh !== "string" ||
    typeof value.en !== "string"
  ) {
    return null;
  }

  return {
    id: typeof value.id === "string" && value.id ? value.id : `favorite-${hashString(value.key)}`,
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

function normalizeHeadingPath(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim());
}

function normalizeFavoriteText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

async function handleManualSync() {
  if (syncState.isManualSyncing) return;

  window.clearTimeout(syncState.writeTimer);
  syncState.writeTimer = null;
  syncState.isManualSyncing = true;
  renderSyncButton();

  const ok = await syncDocumentsFromServer({ pushMerged: true });

  syncState.isManualSyncing = false;
  renderSyncButton();

  if (!ok) {
    alert("同步失败，请确认网络和服务状态后再试。");
  }
}

function renderSyncButton() {
  syncButton.disabled = syncState.isManualSyncing;
  syncButton.classList.toggle("is-syncing", syncState.isManualSyncing);
  syncButton.setAttribute("aria-busy", String(syncState.isManualSyncing));
}

function hashString(value) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

function getNowIso() {
  return new Date().toISOString();
}

function renderSpeechButton() {
  if (!isTtsPlaybackSupported()) {
    speakButton.disabled = true;
    speakButton.textContent = "";
    speakButton.setAttribute("aria-label", "当前环境不支持朗读");
    speakButton.title = "当前环境不支持朗读";
    speakButton.setAttribute("aria-pressed", "false");
    speakButton.classList.remove("is-speaking");
    return;
  }

  const languageLabel = state.isFlipped ? "英文" : "中文";
  speakButton.disabled = false;
  speakButton.textContent = "";
  speakButton.setAttribute("aria-label", speechState.isSpeaking ? "停止当前朗读" : `朗读当前${languageLabel}内容`);
  speakButton.title = speechState.isSpeaking ? "停止当前朗读" : `朗读当前${languageLabel}内容`;
  speakButton.setAttribute("aria-pressed", String(speechState.isSpeaking));
  speakButton.classList.toggle("is-speaking", speechState.isSpeaking);
}

function toggleSpeech() {
  if (!isTtsPlaybackSupported()) {
    alert("当前环境不支持朗读功能，请换用 Chrome、Safari 或 Edge 再试。");
    return;
  }

  if (speechState.isSpeaking) {
    stopSpeech();
    return;
  }

  const speech = getActiveSpeechContent();
  if (!speech.text) return;

  stopSpeech({ render: false });

  speechState.isSpeaking = true;
  renderSpeechButton();

  if (shouldUseRemoteTts()) {
    playRemoteTts(speech);
    return;
  }

  speakWithNativeTts(speech);
}

function speakWithNativeTts(speech) {
  if (!isSpeechSupported()) {
    playRemoteTts(speech);
    return;
  }

  const utterance = new SpeechSynthesisUtterance(speech.text);
  utterance.lang = speech.lang;
  utterance.rate = speech.lang.startsWith("en") ? 0.88 : 0.96;
  utterance.pitch = 1;
  utterance.voice = getPreferredVoice(speech.lang);
  utterance.onend = () => completeSpeech(utterance);
  utterance.onerror = () => {
    if (speechState.activeUtterance !== utterance) return;
    speechState.activeUtterance = null;
    playRemoteTts(speech);
  };

  speechState.activeUtterance = utterance;
  try {
    window.speechSynthesis.speak(utterance);
  } catch {
    speechState.activeUtterance = null;
    playRemoteTts(speech);
  }
}

function playRemoteTts(speech) {
  if (typeof Audio === "undefined") {
    failSpeechPlayback("当前环境无法播放音频。");
    return;
  }

  const audio = new Audio(getTtsUrl(speech));
  audio.preload = "auto";
  audio.onended = () => completeAudio(audio);
  audio.onerror = () => failSpeechPlayback("朗读音频加载失败，请稍后重试。", audio);
  speechState.activeAudio = audio;

  const playPromise = audio.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => failSpeechPlayback("朗读播放失败，请确认飞书允许当前页面播放声音。", audio));
  }
}

function stopSpeech(options = {}) {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }

  if (speechState.activeAudio) {
    speechState.activeAudio.pause();
    speechState.activeAudio.removeAttribute("src");
    speechState.activeAudio.load();
  }

  speechState.activeUtterance = null;
  speechState.activeAudio = null;
  speechState.isSpeaking = false;

  if (options.render !== false && studyView.classList.contains("is-active")) {
    renderSpeechButton();
  }
}

function completeSpeech(utterance) {
  if (speechState.activeUtterance !== utterance) return;

  speechState.activeUtterance = null;
  speechState.isSpeaking = false;
  renderSpeechButton();
}

function completeAudio(audio) {
  if (speechState.activeAudio !== audio) return;

  speechState.activeAudio = null;
  speechState.isSpeaking = false;
  renderSpeechButton();
}

function failSpeechPlayback(message, audio = speechState.activeAudio) {
  if (audio && speechState.activeAudio !== audio) return;

  speechState.activeUtterance = null;
  speechState.activeAudio = null;
  speechState.isSpeaking = false;
  renderSpeechButton();
  alert(message);
}

function getActiveSpeechContent() {
  const card = getActiveCard();
  return state.isFlipped
    ? { text: card.en, lang: "en-US" }
    : { text: card.zh, lang: "zh-CN" };
}

function getPreferredVoice(lang) {
  const voices = window.speechSynthesis.getVoices();
  const exactVoice = voices.find((voice) => voice.lang.toLowerCase() === lang.toLowerCase());
  if (exactVoice) return exactVoice;

  const languagePrefix = lang.split("-")[0].toLowerCase();
  return voices.find((voice) => voice.lang.toLowerCase().startsWith(languagePrefix)) || null;
}

function getTtsUrl(speech) {
  const params = new URLSearchParams({
    text: speech.text,
    lang: speech.lang
  });
  return `${getApiBase()}/api/tts?${params.toString()}`;
}

function getApiBase() {
  return window.location.protocol === "file:" ? "http://localhost:4174" : "";
}

function shouldUseRemoteTts() {
  return isFeishuClient() || !isSpeechSupported();
}

function isFeishuClient() {
  return /Feishu|Lark|LarkLocale|FeishuLocale/i.test(navigator.userAgent);
}

function isTtsPlaybackSupported() {
  return isSpeechSupported() || typeof Audio !== "undefined";
}

function isSpeechSupported() {
  return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

backButton.addEventListener("click", goHome);
addDocumentButton.addEventListener("click", openAddDocumentDialog);
syncButton.addEventListener("click", handleManualSync);
addDocumentForm.addEventListener("submit", handleAddDocument);
closeDialogButton.addEventListener("click", closeAddDocumentDialog);
cancelDialogButton.addEventListener("click", closeAddDocumentDialog);
deleteDocumentForm.addEventListener("submit", handleDeleteDocument);
cancelDeleteDocumentButton.addEventListener("click", closeDeleteDocumentDialog);
deleteDocumentDialog.addEventListener("close", () => {
  deleteState.documentId = null;
});
progressButton.addEventListener("click", toggleCardJumpMenu);
cardButton.addEventListener("click", flipCard);
flipButton.addEventListener("click", flipCard);
speakButton.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleSpeech();
});
favoriteButton.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleFavorite();
});
prevButton.addEventListener("click", () => goToCard(state.cardIndex - 1));
nextButton.addEventListener("click", () => goToCard(state.cardIndex + 1));

if (isSpeechSupported()) {
  window.speechSynthesis.addEventListener("voiceschanged", renderSpeechButton);
  window.addEventListener("beforeunload", () => stopSpeech({ render: false }));
}

document.addEventListener("keydown", (event) => {
  if (!studyView.classList.contains("is-active")) return;
  if (event.key === "Escape") closeCardJumpMenu();
  if (event.target.closest("button, input, textarea, select")) return;

  if (event.key === "ArrowLeft") {
    goToCard(state.cardIndex - 1);
  }

  if (event.key === "ArrowRight") {
    goToCard(state.cardIndex + 1);
  }

  if (event.key === " " || event.key === "Enter") {
    event.preventDefault();
    flipCard();
  }
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".card-jump")) closeCardJumpMenu();
});

renderHome();
renderSyncButton();
syncDocumentsFromServer();

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") syncDocumentsFromServer();
});
