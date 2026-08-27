/* ============================================
   V3 CLASSES — Advanced Enquiry-Based Chatbot
   Guided flows, quick replies, lead capture & state preservation
   ============================================ */

(function () {
  'use strict';

  const API_BASE = window.V3_API_BASE || 'http://localhost:5000/api';
  const CHAT_MSG_API = `${API_BASE}/chat/message`;

  let sessionId = sessionStorage.getItem('v3_chat_session_id') || null;
  let isOpen = false;
  let isBotTyping = false;

  // Generate unique session ID
  function generateSessionId() {
    return 'v3_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
  }

  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('v3_chat_session_id', sessionId);
  }

  // ── Create Chatbot DOM ──
  function createChatWidget() {
    // Remove if already existing
    const existing = document.querySelector('.v3-chat-widget');
    if (existing) existing.remove();

    const widget = document.createElement('div');
    widget.className = 'v3-chat-widget';
    widget.innerHTML = `
      <div class="v3-chat-panel" id="v3ChatPanel">
        <div class="v3-chat-header">
          <div class="v3-chat-header__brand">
            <div class="v3-chat-header__avatar">🎓</div>
            <div class="v3-chat-header__info">
              <h4>V3 Classes Assistant</h4>
              <p><span class="v3-chat-status-dot"></span> Online</p>
            </div>
          </div>
          <div class="v3-chat-header__actions">
            <button class="v3-chat-action-btn" id="v3ChatRestart" title="Restart conversation" aria-label="Restart conversation">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
            </button>
            <button class="v3-chat-action-btn" id="v3ChatClose" title="Close chat" aria-label="Close chat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div class="v3-chat-messages" id="v3ChatMessages"></div>

        <div class="v3-chat-footer">
          <div class="v3-chat-input-wrapper">
            <input type="text" class="v3-chat-input" id="v3ChatInput" placeholder="Type a message or select an option..." autocomplete="off">
          </div>
          <button class="v3-chat-send-btn" id="v3ChatSend" aria-label="Send message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>

      <button class="v3-chat-toggle" id="v3ChatToggle" aria-label="Open V3 Classes Chatbot">
        <span class="v3-chat-toggle__badge"></span>
        <svg class="chat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <svg class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    document.body.appendChild(widget);
    return widget;
  }

  const widget = createChatWidget();
  const toggleBtn = document.getElementById('v3ChatToggle');
  const closeBtn = document.getElementById('v3ChatClose');
  const restartBtn = document.getElementById('v3ChatRestart');
  const messagesContainer = document.getElementById('v3ChatMessages');
  const inputEl = document.getElementById('v3ChatInput');
  const sendBtn = document.getElementById('v3ChatSend');

  // Format current time
  function formatTime() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // ── UI Helpers ──
  function appendUserMessage(text) {
    const row = document.createElement('div');
    row.className = 'v3-chat-msg-row v3-chat-msg-row--user';
    row.innerHTML = `
      <div class="v3-chat-bubble">${escapeHtml(text)}</div>
      <div class="v3-chat-time">${formatTime()}</div>
    `;
    messagesContainer.appendChild(row);
    scrollToBottom();
  }

  function appendBotMessage(text, options = []) {
    const row = document.createElement('div');
    row.className = 'v3-chat-msg-row v3-chat-msg-row--bot';
    
    // Parse markdown basic bold text **bold**
    const formattedText = escapeHtml(text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    let optionsHtml = '';
    if (options && options.length > 0) {
      optionsHtml = `
        <div class="v3-chat-options">
          ${options.map(opt => `<button class="v3-chat-option-btn" data-val="${escapeHtml(opt)}">${escapeHtml(opt)}</button>`).join('')}
        </div>
      `;
    }

    row.innerHTML = `
      <div class="v3-chat-bubble">${formattedText}</div>
      ${optionsHtml}
      <div class="v3-chat-time">${formatTime()}</div>
    `;

    messagesContainer.appendChild(row);
    scrollToBottom();

    // Bind option clicks
    row.querySelectorAll('.v3-chat-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.val;
        // Hide options container after click
        const parentOptions = btn.closest('.v3-chat-options');
        if (parentOptions) {
          parentOptions.style.opacity = '0.5';
          parentOptions.style.pointerEvents = 'none';
        }
        handleSendMessage(val);
      });
    });
  }

  function showTypingIndicator() {
    const typing = document.createElement('div');
    typing.className = 'v3-chat-typing';
    typing.id = 'v3ChatTypingIndicator';
    typing.innerHTML = `
      <span class="v3-chat-typing-dot"></span>
      <span class="v3-chat-typing-dot"></span>
      <span class="v3-chat-typing-dot"></span>
    `;
    messagesContainer.appendChild(typing);
    scrollToBottom();
    return typing;
  }

  function removeTypingIndicator() {
    const typing = document.getElementById('v3ChatTypingIndicator');
    if (typing) typing.remove();
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Send Message Logic ──
  async function handleSendMessage(userText) {
    if (isBotTyping) return;
    const text = (userText || inputEl.value || '').trim();
    if (!text) return;

    appendUserMessage(text);
    inputEl.value = '';
    inputEl.disabled = true;
    sendBtn.disabled = true;
    isBotTyping = true;

    const typingEl = showTypingIndicator();

    try {
      const res = await fetch(CHAT_MSG_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: text,
        }),
      });

      const data = await res.json();
      const delay = (data.data && data.data.typingDelayMs) || 600;

      // Realistic typing animation delay
      setTimeout(() => {
        removeTypingIndicator();
        isBotTyping = false;
        inputEl.disabled = false;
        sendBtn.disabled = false;

        if (data.status === 'success' && data.data) {
          sessionId = data.data.sessionId;
          sessionStorage.setItem('v3_chat_session_id', sessionId);
          appendBotMessage(data.data.response, data.data.options);
        } else {
          appendBotMessage('Sorry, I encountered an issue. Please try again or call 9386851441.', ['Main Menu']);
        }
        inputEl.focus();
      }, delay);

    } catch (err) {
      setTimeout(() => {
        removeTypingIndicator();
        isBotTyping = false;
        inputEl.disabled = false;
        sendBtn.disabled = false;
        appendBotMessage('Unable to reach server. Please call us directly at +91 93868 51441.', ['Main Menu']);
      }, 500);
    }
  }

  // ── Initial Greeting ──
  async function triggerGreeting(isRestart = false) {
    if (isRestart) {
      messagesContainer.innerHTML = '';
    } else if (messagesContainer.children.length > 0) {
      return; // Already initialized
    }

    const typing = showTypingIndicator();
    isBotTyping = true;

    try {
      const res = await fetch(CHAT_MSG_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: isRestart ? 'restart' : '',
        }),
      });
      const data = await res.json();

      setTimeout(() => {
        removeTypingIndicator();
        isBotTyping = false;
        if (data.status === 'success' && data.data) {
          appendBotMessage(data.data.response, data.data.options);
        } else {
          appendBotMessage('Namaste! 👋 Welcome to V3 Classes.\nHow can I help you today?', [
            'Courses', 'Fees', 'Admission', 'Results', 'Talk to Counsellor'
          ]);
        }
      }, 600);
    } catch (e) {
      removeTypingIndicator();
      isBotTyping = false;
      appendBotMessage('Namaste! 👋 Welcome to V3 Classes.\nHow can I help you today?', [
        'Courses', 'Fees', 'Admission', 'Results', 'Talk to Counsellor'
      ]);
    }
  }

  // ── Event Handlers ──
  toggleBtn.addEventListener('click', () => {
    isOpen = !isOpen;
    widget.classList.toggle('open', isOpen);
    if (isOpen) {
      triggerGreeting();
      setTimeout(() => inputEl.focus(), 300);
    }
  });

  closeBtn.addEventListener('click', () => {
    isOpen = false;
    widget.classList.remove('open');
  });

  restartBtn.addEventListener('click', () => {
    sessionId = generateSessionId();
    sessionStorage.setItem('v3_chat_session_id', sessionId);
    triggerGreeting(true);
  });

  sendBtn.addEventListener('click', () => handleSendMessage());

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  });

})();
