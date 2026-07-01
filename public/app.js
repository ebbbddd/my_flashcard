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

const state = {
  documentId: null,
  cardIndex: 0,
  isFlipped: false
};

const speechState = {
  activeUtterance: null,
  isSpeaking: false
};

const homeRefreshState = {
  documentIds: new Set()
};

let documents = loadDocuments();

const homeView = document.querySelector("#home-view");
const studyView = document.querySelector("#study-view");
const documentList = document.querySelector("#document-list");
const addDocumentButton = document.querySelector("#add-document-button");
const addDocumentDialog = document.querySelector("#add-document-dialog");
const addDocumentForm = document.querySelector("#add-document-form");
const closeDialogButton = document.querySelector("#close-dialog-button");
const cancelDialogButton = document.querySelector("#cancel-dialog-button");
const documentUrlInput = document.querySelector("#document-url-input");
const documentFormError = document.querySelector("#document-form-error");
const backButton = document.querySelector("#back-button");
const cardButton = document.querySelector("#card-button");
const flipButton = document.querySelector("#flip-button");
const speakButton = document.querySelector("#speak-button");
const prevButton = document.querySelector("#prev-button");
const nextButton = document.querySelector("#next-button");
const studyTitle = document.querySelector("#study-title");
const studySection = document.querySelector("#study-section");
const progressButton = document.querySelector("#progress-button");
const cardJumpMenu = document.querySelector("#card-jump-menu");
const cardFrontText = document.querySelector("#card-front-text");
const cardBackText = document.querySelector("#card-back-text");

function loadDocuments() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [...seedDocuments];

    const stored = parsed.filter(isCachedDocument);

    const seedDocumentsWithCache = seedDocuments.map((seedDocument) => {
      const cachedDocument = stored.find((doc) => doc.id === seedDocument.id);
      return cachedDocument ? { ...seedDocument, ...cachedDocument, isCustom: false } : seedDocument;
    });
    const customDocuments = stored.filter((doc) => {
      return doc.isCustom && !seedDocuments.some((seedDocument) => seedDocument.id === doc.id);
    });

    return [...seedDocumentsWithCache, ...customDocuments];
  } catch {
    return [...seedDocuments];
  }
}

function saveDocuments() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents.filter(isCachedDocument)));
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
  return documents.find((document) => document.id === state.documentId) ?? documents[0];
}

function getActiveCard() {
  const document = getActiveDocument();
  return document.cards[state.cardIndex];
}

function renderHome() {
  documentList.replaceChildren(
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
      button.addEventListener("click", () => openDocument(doc.id));

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

function openAddDocumentDialog() {
  documentFormError.textContent = "";
  addDocumentForm.reset();
  addDocumentDialog.showModal();
  requestAnimationFrame(() => documentUrlInput.focus());
}

function closeAddDocumentDialog() {
  addDocumentDialog.close();
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
  studySection.textContent = document.section;
  progressButton.textContent = `${displayIndex} / ${cardCount}`;
  cardFrontText.textContent = card.zh;
  cardBackText.textContent = card.en;
  cardButton.classList.toggle("is-flipped", state.isFlipped);
  flipButton.textContent = state.isFlipped ? "看中文" : "看英文";
  prevButton.disabled = state.cardIndex === 0;
  nextButton.disabled = state.cardIndex === cardCount - 1;
  renderSpeechButton();
  renderCardJumpMenu();
}

async function requestDocumentRefresh(sourceUrl) {
  const apiBase = window.location.protocol === "file:" ? "http://localhost:4174" : "";
  const response = await fetch(`${apiBase}/api/refresh-document`, {
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
  cardJumpMenu.replaceChildren(
    ...activeDocument.cards.map((card, index) => {
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
    })
  );
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

function renderSpeechButton() {
  if (!isSpeechSupported()) {
    speakButton.disabled = true;
    speakButton.textContent = "";
    speakButton.setAttribute("aria-label", "当前浏览器不支持朗读");
    speakButton.title = "当前浏览器不支持朗读";
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
  if (!isSpeechSupported()) {
    alert("当前浏览器不支持朗读功能，请换用 Chrome、Safari 或 Edge 再试。");
    return;
  }

  if (speechState.isSpeaking) {
    stopSpeech();
    return;
  }

  const speech = getActiveSpeechContent();
  if (!speech.text) return;

  stopSpeech({ render: false });

  const utterance = new SpeechSynthesisUtterance(speech.text);
  utterance.lang = speech.lang;
  utterance.rate = speech.lang.startsWith("en") ? 0.88 : 0.96;
  utterance.pitch = 1;
  utterance.voice = getPreferredVoice(speech.lang);
  utterance.onend = () => completeSpeech(utterance);
  utterance.onerror = () => completeSpeech(utterance);

  speechState.activeUtterance = utterance;
  speechState.isSpeaking = true;
  renderSpeechButton();
  window.speechSynthesis.speak(utterance);
}

function stopSpeech(options = {}) {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }

  speechState.activeUtterance = null;
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

function isSpeechSupported() {
  return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

backButton.addEventListener("click", goHome);
addDocumentButton.addEventListener("click", openAddDocumentDialog);
addDocumentForm.addEventListener("submit", handleAddDocument);
closeDialogButton.addEventListener("click", closeAddDocumentDialog);
cancelDialogButton.addEventListener("click", closeAddDocumentDialog);
progressButton.addEventListener("click", toggleCardJumpMenu);
cardButton.addEventListener("click", flipCard);
flipButton.addEventListener("click", flipCard);
speakButton.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleSpeech();
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
