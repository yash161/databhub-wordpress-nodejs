/*!
 * Jim — DataHub AI Assistant Widget
 * Vanilla JS, zero dependencies. Fully isolated via Shadow DOM.
 * Safe to drop on any page: creates exactly one element (#jim-chat-root)
 * and touches nothing else in the document.
 */
(function () {
  "use strict";

  // ---- Config -------------------------------------------------------
  var API_BASE = "https://demonstrated-brakes-meet-race.trycloudflare.com";
  var CHAT_ENDPOINT = API_BASE + "/chat";
  var HEALTH_ENDPOINT = API_BASE + "/health";
  var OFFLINE_MSG = "Jim is offline right now. Please contact info@datahubusa.com.";
  var REQUEST_TIMEOUT_MS = 30000;
  var STORAGE_KEY = "jim_chat_history_v1";
  var MAX_HISTORY_TURNS = 6;

  // Guard against double-injection (e.g. widget loaded twice)
  if (document.getElementById("jim-chat-root")) return;

  // ---- Host element + Shadow DOM -------------------------------------
  var host = document.createElement("div");
  host.id = "jim-chat-root";
  // Inline reset styles on the host itself (outside shadow, so they can't be
  // clobbered by page CSS, and can't leak out either since they're scoped
  // to this one element's box).
  host.style.all = "initial";
  host.style.position = "fixed";
  host.style.zIndex = "2147483000";
  host.style.bottom = "0";
  host.style.right = "0";
  host.style.display = "block";

  var shadow = host.attachShadow({ mode: "open" });

  var style = document.createElement("style");
  style.textContent = [
    "*{box-sizing:border-box;margin:0;padding:0;}",
    ":host{font-family:'Montserrat',Helvetica,Arial,Lucida,sans-serif;}",
    ".jim-wrap{position:fixed;bottom:24px;right:24px;display:flex;flex-direction:column;align-items:flex-end;font-family:'Montserrat',Helvetica,Arial,Lucida,sans-serif;}",

    /* Launcher button */
    ".jim-launcher{width:60px;height:60px;border-radius:50%;background:linear-gradient(145deg,#0A65FF,#0845c4);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(10,101,255,0.45),0 2px 6px rgba(1,1,23,0.3);transition:transform .22s ease,box-shadow .22s ease;position:relative;}",
    ".jim-launcher:hover{transform:scale(1.07);box-shadow:0 8px 26px rgba(10,101,255,0.55),0 2px 8px rgba(1,1,23,0.35);}",
    ".jim-launcher:active{transform:scale(0.96);}",
    ".jim-launcher svg{width:28px;height:28px;}",
    ".jim-launcher .jim-close-icon{display:none;}",
    ".jim-launcher.jim-open .jim-chat-icon{display:none;}",
    ".jim-launcher.jim-open .jim-close-icon{display:block;}",

    /* Pulse ring to draw the eye on first load, stops after a few beats */
    ".jim-pulse{position:absolute;inset:0;border-radius:50%;border:2px solid rgba(10,101,255,0.55);animation:jim-pulse 2.2s ease-out 3;}",
    "@keyframes jim-pulse{0%{transform:scale(1);opacity:.9;}100%{transform:scale(1.55);opacity:0;}}",

    /* Badge label that peeks out next to the button */
    ".jim-label{position:absolute;right:72px;bottom:18px;background:#010117;color:#fff;font-size:13px;font-weight:600;padding:8px 14px;border-radius:8px;white-space:nowrap;box-shadow:0 4px 14px rgba(1,1,23,0.35);opacity:0;transform:translateX(8px);transition:opacity .25s ease,transform .25s ease;pointer-events:none;}",
    ".jim-label.jim-show{opacity:1;transform:translateX(0);}",
    ".jim-label:after{content:'';position:absolute;right:-5px;top:50%;transform:translateY(-50%) rotate(45deg);width:10px;height:10px;background:#010117;}",

    /* Panel */
    ".jim-panel{width:360px;max-width:calc(100vw - 32px);height:520px;max-height:calc(100vh - 120px);background:#0b0b24;border-radius:18px;box-shadow:0 20px 60px rgba(1,1,23,0.5),0 4px 16px rgba(0,0,0,0.25);display:flex;flex-direction:column;overflow:hidden;position:absolute;bottom:76px;right:0;opacity:0;transform:translateY(16px) scale(.98);pointer-events:none;transition:opacity .22s ease,transform .22s ease;border:1px solid rgba(10,101,255,0.25);}",
    ".jim-panel.jim-open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}",

    /* Header */
    ".jim-header{background:linear-gradient(135deg,#0A65FF,#073e9e);padding:18px 18px;display:flex;align-items:center;gap:12px;flex-shrink:0;}",
    ".jim-avatar{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;flex-shrink:0;}",
    ".jim-avatar svg{width:22px;height:22px;}",
    ".jim-header-text{flex:1;min-width:0;}",
    ".jim-header-title{color:#fff;font-size:16px;font-weight:700;line-height:1.2;}",
    ".jim-header-sub{color:rgba(255,255,255,0.85);font-size:12px;font-weight:500;display:flex;align-items:center;gap:5px;margin-top:2px;}",
    ".jim-dot{width:7px;height:7px;border-radius:50%;background:#2ecc71;display:inline-block;flex-shrink:0;}",
    ".jim-dot.jim-dot-off{background:#e74c3c;}",
    ".jim-header-close{background:rgba(255,255,255,0.15);border:none;width:30px;height:30px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .18s ease;}",
    ".jim-header-close:hover{background:rgba(255,255,255,0.28);}",
    ".jim-header-close svg{width:14px;height:14px;}",

    /* Messages */
    ".jim-messages{flex:1;overflow-y:auto;padding:18px 16px;display:flex;flex-direction:column;gap:12px;background:#010117;scrollbar-width:thin;}",
    ".jim-messages::-webkit-scrollbar{width:6px;}",
    ".jim-messages::-webkit-scrollbar-thumb{background:rgba(10,101,255,0.35);border-radius:3px;}",
    ".jim-row{display:flex;gap:8px;max-width:100%;}",
    ".jim-row.jim-user{justify-content:flex-end;}",
    ".jim-bubble{padding:10px 14px;border-radius:14px;font-size:14px;line-height:1.5;word-wrap:break-word;max-width:82%;white-space:pre-wrap;}",
    ".jim-row.jim-bot .jim-bubble{background:#161638;color:#f2f3f7;border-bottom-left-radius:4px;}",
    ".jim-row.jim-user .jim-bubble{background:#0A65FF;color:#fff;border-bottom-right-radius:4px;}",
    ".jim-bubble a{color:#7fb1ff;text-decoration:underline;}",
    ".jim-row.jim-user .jim-bubble a{color:#e6f0ff;}",
    ".jim-mini-avatar{width:26px;height:26px;border-radius:50%;background:#0A65FF;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;}",
    ".jim-mini-avatar svg{width:14px;height:14px;}",

    /* Sources */
    ".jim-sources{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;margin-left:34px;}",
    ".jim-source-pill{font-size:11px;background:rgba(10,101,255,0.14);color:#7fb1ff;border:1px solid rgba(10,101,255,0.35);border-radius:20px;padding:4px 10px;text-decoration:none;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block;transition:background .15s ease;}",
    ".jim-source-pill:hover{background:rgba(10,101,255,0.28);}",
    ".jim-source-pill.jim-no-link{cursor:default;}",

    /* Typing indicator */
    ".jim-typing{display:flex;gap:4px;padding:12px 14px;background:#161638;border-radius:14px;border-bottom-left-radius:4px;width:fit-content;}",
    ".jim-typing span{width:6px;height:6px;border-radius:50%;background:#7fb1ff;animation:jim-bounce 1.2s infinite ease-in-out;}",
    ".jim-typing span:nth-child(2){animation-delay:.15s;}",
    ".jim-typing span:nth-child(3){animation-delay:.3s;}",
    "@keyframes jim-bounce{0%,80%,100%{transform:translateY(0);opacity:.5;}40%{transform:translateY(-5px);opacity:1;}}",

    /* Quick suggestions */
    ".jim-suggestions{display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 12px;background:#010117;flex-shrink:0;}",
    ".jim-suggestion{font-size:12px;background:rgba(10,101,255,0.1);color:#9fc2ff;border:1px solid rgba(10,101,255,0.3);border-radius:16px;padding:6px 12px;cursor:pointer;transition:background .15s ease,color .15s ease;font-family:inherit;}",
    ".jim-suggestion:hover{background:rgba(10,101,255,0.25);color:#fff;}",

    /* Input */
    ".jim-inputbar{display:flex;align-items:flex-end;gap:8px;padding:12px 14px;background:#0b0b24;border-top:1px solid rgba(255,255,255,0.06);flex-shrink:0;}",
    ".jim-textarea{flex:1;resize:none;border:1px solid rgba(255,255,255,0.12);background:#161638;color:#f2f3f7;border-radius:12px;padding:10px 12px;font-size:14px;font-family:inherit;line-height:1.4;max-height:90px;outline:none;transition:border-color .15s ease;}",
    ".jim-textarea:focus{border-color:#0A65FF;}",
    ".jim-textarea::placeholder{color:#6a6a8a;}",
    ".jim-send{width:40px;height:40px;border-radius:50%;background:#0A65FF;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .15s ease,transform .1s ease;}",
    ".jim-send:hover{background:#0845c4;}",
    ".jim-send:active{transform:scale(0.92);}",
    ".jim-send:disabled{background:#2a2a4a;cursor:default;}",
    ".jim-send svg{width:17px;height:17px;}",

    ".jim-footer-note{text-align:center;font-size:10px;color:#4a4a6a;padding:6px 0 10px;background:#010117;flex-shrink:0;}",

    /* Error / offline banner inside messages */
    ".jim-error-bubble{background:#3a1414!important;color:#ffb4b4!important;border:1px solid rgba(231,76,60,0.4);}",

    /* Mobile */
    "@media (max-width:480px){",
    "  .jim-wrap{bottom:16px;right:16px;}",
    "  .jim-panel{width:calc(100vw - 24px);height:calc(100vh - 140px);bottom:76px;right:-8px;border-radius:16px;}",
    "  .jim-label{display:none;}",
    "}"
  ].join("\n");

  shadow.appendChild(style);

  var ICON_CHAT = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 5.94 2 10.8c0 2.62 1.28 4.96 3.3 6.57-.1.95-.46 2.46-1.33 3.9a.5.5 0 0 0 .58.74c1.9-.57 3.37-1.46 4.26-2.1.99.26 2.05.4 3.19.4 5.52 0 10-3.94 10-8.8S17.52 2 12 2Z" fill="#fff"/></svg>';
  var ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6l12 12M18 6L6 18" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 11.5l17.5-8-6.7 18-3.2-7.6-7.6-2.4Z" fill="#fff"/></svg>';
  var ICON_X = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 5l14 14M19 5L5 19" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';
  var ICON_JIM_HEAD = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="4" fill="#fff"/><path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" stroke="#fff" stroke-width="1.6" stroke-linecap="round" fill="none"/></svg>';

  var root = document.createElement("div");
  root.className = "jim-wrap";
  root.innerHTML =
    '<div class="jim-label" id="jim-label">Chat with Jim 👋</div>' +
    '<button class="jim-launcher" id="jim-launcher" aria-label="Open chat with Jim" type="button">' +
      '<div class="jim-pulse"></div>' +
      '<span class="jim-chat-icon">' + ICON_CHAT + '</span>' +
      '<span class="jim-close-icon">' + ICON_CLOSE + '</span>' +
    '</button>' +
    '<div class="jim-panel" id="jim-panel" role="dialog" aria-label="Chat with Jim">' +
      '<div class="jim-header">' +
        '<div class="jim-avatar">' + ICON_JIM_HEAD + '</div>' +
        '<div class="jim-header-text">' +
          '<div class="jim-header-title">Jim</div>' +
          '<div class="jim-header-sub"><span class="jim-dot" id="jim-status-dot"></span><span id="jim-status-text">DataHub Assistant</span></div>' +
        '</div>' +
        '<button class="jim-header-close" id="jim-header-close" aria-label="Close chat" type="button">' + ICON_X + '</button>' +
      '</div>' +
      '<div class="jim-messages" id="jim-messages"></div>' +
      '<div class="jim-suggestions" id="jim-suggestions"></div>' +
      '<div class="jim-inputbar">' +
        '<textarea class="jim-textarea" id="jim-input" rows="1" maxlength="1000" placeholder="Ask Jim about DataHub..."></textarea>' +
        '<button class="jim-send" id="jim-send" aria-label="Send message" type="button">' + ICON_SEND + '</button>' +
      '</div>' +
      '<div class="jim-footer-note">Jim can make mistakes. Verify important info with our team.</div>' +
    '</div>';

  shadow.appendChild(root);
  document.body.appendChild(host);

  // ---- Elements -------------------------------------------------------
  var launcher = shadow.getElementById("jim-launcher");
  var panel = shadow.getElementById("jim-panel");
  var label = shadow.getElementById("jim-label");
  var headerClose = shadow.getElementById("jim-header-close");
  var messagesEl = shadow.getElementById("jim-messages");
  var suggestionsEl = shadow.getElementById("jim-suggestions");
  var inputEl = shadow.getElementById("jim-input");
  var sendBtn = shadow.getElementById("jim-send");
  var statusDot = shadow.getElementById("jim-status-dot");
  var statusText = shadow.getElementById("jim-status-text");

  var isOpen = false;
  var isSending = false;
  var apiOnline = null; // unknown until checked
  var history = loadHistory();

  var SUGGESTIONS = [
    "What services do you offer?",
    "Which industries do you serve?",
    "How do I contact you?"
  ];

  // ---- Helpers ----------------------------------------------------------
  function loadHistory() {
    try {
      var raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveHistory() {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-20)));
    } catch (e) { /* storage unavailable — fine, chat still works in-memory */ }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Turn plain text into safe HTML: escape, then linkify bare URLs, then \n -> <br>
  function formatAnswer(text) {
    var escaped = escapeHtml(text);
    var urlRegex = /((https?:\/\/|www\.)[^\s<]+)/gi;
    var linked = escaped.replace(urlRegex, function (match) {
      var href = match.indexOf("http") === 0 ? match : "https://" + match;
      // strip trailing punctuation from the visible/href URL
      var trail = "";
      var cleaned = href.replace(/[.,;:!?)]+$/, function (p) { trail = p; return ""; });
      return '<a href="' + cleaned + '" target="_blank" rel="noopener noreferrer">' + match.replace(/[.,;:!?)]+$/, "") + '</a>' + trail;
    });
    return linked.replace(/\n/g, "<br>");
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addUserMessage(text) {
    var row = document.createElement("div");
    row.className = "jim-row jim-user";
    var bubble = document.createElement("div");
    bubble.className = "jim-bubble";
    bubble.textContent = text;
    row.appendChild(bubble);
    messagesEl.appendChild(row);
    scrollToBottom();
  }

  function addBotMessage(answer, sources, isError) {
    var row = document.createElement("div");
    row.className = "jim-row jim-bot";

    var avatar = document.createElement("div");
    avatar.className = "jim-mini-avatar";
    avatar.innerHTML = ICON_JIM_HEAD;
    row.appendChild(avatar);

    var col = document.createElement("div");
    col.style.display = "flex";
    col.style.flexDirection = "column";
    col.style.maxWidth = "82%";

    var bubble = document.createElement("div");
    bubble.className = "jim-bubble" + (isError ? " jim-error-bubble" : "");
    bubble.innerHTML = formatAnswer(answer);
    col.appendChild(bubble);
    row.appendChild(col);
    messagesEl.appendChild(row);

    if (sources && sources.length) {
      var srcWrap = document.createElement("div");
      srcWrap.className = "jim-sources";
      sources.slice(0, 3).forEach(function (s) {
        if (s && s.url) {
          var a = document.createElement("a");
          a.className = "jim-source-pill";
          a.href = s.url;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.textContent = s.title || s.url;
          srcWrap.appendChild(a);
        } else if (s && s.title) {
          var span = document.createElement("span");
          span.className = "jim-source-pill jim-no-link";
          span.textContent = s.title;
          srcWrap.appendChild(span);
        }
      });
      if (srcWrap.childNodes.length) messagesEl.appendChild(srcWrap);
    }
    scrollToBottom();
  }

  var typingRow = null;
  function showTyping() {
    typingRow = document.createElement("div");
    typingRow.className = "jim-row jim-bot";
    var avatar = document.createElement("div");
    avatar.className = "jim-mini-avatar";
    avatar.innerHTML = ICON_JIM_HEAD;
    var typing = document.createElement("div");
    typing.className = "jim-typing";
    typing.innerHTML = "<span></span><span></span><span></span>";
    typingRow.appendChild(avatar);
    typingRow.appendChild(typing);
    messagesEl.appendChild(typingRow);
    scrollToBottom();
  }
  function hideTyping() {
    if (typingRow && typingRow.parentNode) typingRow.parentNode.removeChild(typingRow);
    typingRow = null;
  }

  function setOnlineStatus(online) {
    apiOnline = online;
    if (online) {
      statusDot.classList.remove("jim-dot-off");
      statusText.textContent = "DataHub Assistant";
    } else {
      statusDot.classList.add("jim-dot-off");
      statusText.textContent = "Offline";
    }
  }

  function renderSuggestions() {
    suggestionsEl.innerHTML = "";
    SUGGESTIONS.forEach(function (q) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "jim-suggestion";
      btn.textContent = q;
      btn.addEventListener("click", function () {
        if (isSending) return;
        inputEl.value = q;
        sendMessage();
      });
      suggestionsEl.appendChild(btn);
    });
  }

  function greetIfEmpty() {
    if (messagesEl.childNodes.length === 0) {
      addBotMessage(
        "Hi, I'm Jim 👋 I can answer questions about DataHub's services, industries, and how to get in touch. What would you like to know?",
        null,
        false
      );
    }
  }

  function fetchWithTimeout(url, options, timeoutMs) {
    return new Promise(function (resolve, reject) {
      var timedOut = false;
      var timer = setTimeout(function () {
        timedOut = true;
        reject(new Error("timeout"));
      }, timeoutMs);

      fetch(url, options).then(
        function (res) {
          if (timedOut) return;
          clearTimeout(timer);
          resolve(res);
        },
        function (err) {
          if (timedOut) return;
          clearTimeout(timer);
          reject(err);
        }
      );
    });
  }

  function checkHealth() {
    fetchWithTimeout(HEALTH_ENDPOINT, { method: "GET" }, 8000)
      .then(function (res) {
        setOnlineStatus(!!(res && res.ok));
      })
      .catch(function () {
        setOnlineStatus(false);
      });
  }

  function sendMessage() {
    var text = inputEl.value.trim();
    if (!text || isSending) return;

    if (text.length > 1000) {
      addBotMessage("That message is a little long — could you shorten it to under 1000 characters?", null, true);
      return;
    }

    addUserMessage(text);
    inputEl.value = "";
    autoResize();
    isSending = true;
    sendBtn.disabled = true;
    showTyping();

    var payloadHistory = history.slice(-MAX_HISTORY_TURNS * 2);

    fetchWithTimeout(
      CHAT_ENDPOINT,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: payloadHistory })
      },
      REQUEST_TIMEOUT_MS
    )
      .then(function (res) {
        return res.json().then(function (data) {
          return { status: res.status, data: data };
        }).catch(function () {
          return { status: res.status, data: null };
        });
      })
      .then(function (result) {
        hideTyping();
        isSending = false;
        sendBtn.disabled = false;

        if (result.status === 200 && result.data && result.data.answer) {
          setOnlineStatus(true);
          addBotMessage(result.data.answer, result.data.sources, false);
          history.push({ role: "user", content: text });
          history.push({ role: "assistant", content: result.data.answer });
          saveHistory();
        } else if (result.status === 400 || result.status === 429) {
          var msg = (result.data && result.data.error) ? result.data.error : "Something went wrong with that request.";
          addBotMessage(msg, null, true);
        } else {
          setOnlineStatus(false);
          addBotMessage(OFFLINE_MSG, null, true);
        }
      })
      .catch(function () {
        hideTyping();
        isSending = false;
        sendBtn.disabled = false;
        setOnlineStatus(false);
        addBotMessage(OFFLINE_MSG, null, true);
      });
  }

  function autoResize() {
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(inputEl.scrollHeight, 90) + "px";
  }

  function openPanel() {
    isOpen = true;
    panel.classList.add("jim-open");
    launcher.classList.add("jim-open");
    launcher.setAttribute("aria-label", "Close chat with Jim");
    label.classList.remove("jim-show");
    greetIfEmpty();
    if (apiOnline === null) checkHealth();
    setTimeout(function () { inputEl.focus(); }, 180);
  }

  function closePanel() {
    isOpen = false;
    panel.classList.remove("jim-open");
    launcher.classList.remove("jim-open");
    launcher.setAttribute("aria-label", "Open chat with Jim");
  }

  function togglePanel() {
    if (isOpen) closePanel();
    else openPanel();
  }

  // ---- Wire up events -----------------------------------------------
  launcher.addEventListener("click", togglePanel);
  headerClose.addEventListener("click", closePanel);

  sendBtn.addEventListener("click", sendMessage);
  inputEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  inputEl.addEventListener("input", autoResize);

  // Friendly label peek: show once after a short delay, then hide.
  setTimeout(function () {
    if (!isOpen) label.classList.add("jim-show");
    setTimeout(function () {
      if (!isOpen) label.classList.remove("jim-show");
    }, 4500);
  }, 1800);

  renderSuggestions();

  // Passive background health check shortly after load (doesn't block UI)
  setTimeout(checkHealth, 1200);
})();
