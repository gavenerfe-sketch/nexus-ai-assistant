document.addEventListener("DOMContentLoaded", () => {
    const promptInput = document.getElementById("promptInput");
    const sendBtn = document.getElementById("sendBtn");
    const newChatBtn = document.getElementById("newChatBtn");
    const searchInput = document.getElementById("searchInput");
    const messagesContainer = document.getElementById("messagesContainer");
    const historyList = document.getElementById("historyList");
    const workspaceHeader = document.querySelector(".workspace-header");
    const wordTokenCounter = document.querySelector(".counter-bar");
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    const themeIcon = document.getElementById("themeIcon");

    let chats = JSON.parse(localStorage.getItem("nexus_chats")) || [
        { id: "chat_initial", title: "New Conversation", messages: [] }
    ];
    let currentChatId = chats[0].id;
    let searchQuery = "";

    let userScrolledUp = false;
    messagesContainer.addEventListener("scroll", () => {
        const threshold = 50;
        const position = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight;
        userScrolledUp = position > threshold;
    });

    function scrollToBottom(smooth = true) {
        if (!userScrolledUp) {
            messagesContainer.scrollTo({
                top: messagesContainer.scrollHeight,
                behavior: smooth ? "smooth" : "auto"
            });
        }
    }

    function updateThemeIcon(isLight) {
        if (themeIcon) {
            if (isLight) {
                themeIcon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
            } else {
                themeIcon.innerHTML = `
                    <circle cx="12" cy="12" r="4"></circle>
                    <path d="M12 2v2"></path>
                    <path d="M12 20v2"></path>
                    <path d="m4.93 4.93 1.41 1.41"></path>
                    <path d="m17.66 17.66 1.41 1.41"></path>
                    <path d="M2 12h2"></path>
                    <path d="M20 12h2"></path>
                    <path d="m6.34 17.66-1.41 1.41"></path>
                    <path d="m19.07 4.93-1.41 1.41"></path>
                `;
            }
        }
    }

    if (localStorage.getItem("theme") === "light") {
        document.body.classList.add("light-mode");
        updateThemeIcon(true);
    } else {
        updateThemeIcon(false);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            document.body.classList.toggle("light-mode");
            const isLight = document.body.classList.contains("light-mode");
            localStorage.setItem("theme", isLight ? "light" : "dark");
            updateThemeIcon(isLight);
        });
    }

    if (promptInput && wordTokenCounter) {
        promptInput.addEventListener("input", () => {
            const text = promptInput.value.trim();
            const words = text === "" ? 0 : text.split(/\s+/).length;
            const estTokens = Math.ceil(text.length / 4);
            wordTokenCounter.textContent = `Words: ${words} | Est. Tokens: ${estTokens}`;
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            renderHistoryList();
        });
    }

    function renderHistoryList() {
        if (!historyList) return;
        historyList.innerHTML = "";

        const filteredChats = chats.filter(chat =>
            chat.title.toLowerCase().includes(searchQuery)
        );

        if (filteredChats.length === 0) {
            historyList.innerHTML = `<div style="padding: 8px 12px; font-size: 0.85rem; color: #71717a;">No matching chats found</div>`;
            return;
        }

        filteredChats.forEach(chat => {
            const item = document.createElement("div");
            item.className = `history-item ${chat.id === currentChatId ? "active" : ""}`;

            item.innerHTML = `
                <span class="history-title-text">${chat.title}</span>
                <div class="history-actions">
                    <button class="history-delete-btn" title="Delete Chat">&times;</button>
                </div>
            `;

            item.addEventListener("click", (e) => {
                if (e.target.classList.contains("history-delete-btn")) return;
                switchChat(chat.id);
            });

            const deleteBtn = item.querySelector(".history-delete-btn");
            deleteBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                deleteChat(chat.id);
            });

            historyList.appendChild(item);
        });
    }

    function switchChat(chatId) {
        currentChatId = chatId;
        const targetChat = chats.find(c => c.id === chatId);
        if (!targetChat) return;

        if (workspaceHeader) workspaceHeader.textContent = targetChat.title;
        messagesContainer.innerHTML = "";
        userScrolledUp = false;

        if (targetChat.messages.length === 0) {
            appendMessage("Hello! I am your local Nexus assistant. How can I help you today?", "ai-message", false);
        } else {
            targetChat.messages.forEach(msg => {
                const className = msg.role === "assistant" ? "ai-message" : "user-message";
                appendMessage(msg.content, className, false);
            });
        }

        renderHistoryList();
    }

    if (newChatBtn) {
        newChatBtn.addEventListener("click", () => {
            const newId = "chat_" + Date.now();
            const newChat = {
                id: newId,
                title: "New Conversation",
                messages: []
            };
            chats.unshift(newChat);
            localStorage.setItem("nexus_chats", JSON.stringify(chats));
            switchChat(newId);
        });
    }

    function deleteChat(chatId) {
        chats = chats.filter(c => c.id !== chatId);
        if (chats.length === 0) {
            chats.push({ id: "chat_" + Date.now(), title: "New Conversation", messages: [] });
        }
        localStorage.setItem("nexus_chats", JSON.stringify(chats));
        switchChat(chats[0].id);
    }

    function handleSendMessage() {
        if (!promptInput) return;
        const messageText = promptInput.value.trim();
        if (!messageText) return;

        const activeChat = chats.find(c => c.id === currentChatId);
        if (!activeChat) return;

        if (activeChat.title === "New Conversation") {
            activeChat.title = messageText.length > 25 ? messageText.substring(0, 25) + "..." : messageText;
            if (workspaceHeader) workspaceHeader.textContent = activeChat.title;
        }

        userScrolledUp = false;
        activeChat.messages.push({ role: "user", content: messageText });
        appendMessage(messageText, "user-message", true);

        promptInput.value = "";
        if (wordTokenCounter) wordTokenCounter.textContent = `Words: 0 | Est. Tokens: 0`;

        const loadingDiv = document.createElement("div");
        loadingDiv.className = "message ai-message";
        loadingDiv.id = "activeLoading";
        loadingDiv.innerHTML = `
            <div class="gemini-thinking">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        messagesContainer.appendChild(loadingDiv);
        scrollToBottom();

        const selectedModel = document.getElementById("modelSelect") ? document.getElementById("modelSelect").value : "groq-20b";

        fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: activeChat.messages,
                model: selectedModel
            })
        })
            .then(res => res.json())
            .then(data => {
                const activeLoader = document.getElementById("activeLoading");
                if (activeLoader) activeLoader.remove();

                let rawResponse = data.response || "No response received.";
                // Filter out emojis and unicode symbols completely on the client side
                const aiResponseText = rawResponse.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();

                activeChat.messages.push({ role: "assistant", content: aiResponseText });
                localStorage.setItem("nexus_chats", JSON.stringify(chats));

                appendMessage(aiResponseText, "ai-message", true);
                renderHistoryList();
            })
            .catch(err => {
                const activeLoader = document.getElementById("activeLoading");
                if (activeLoader) activeLoader.remove();
                appendMessage("Error connecting to Nexus backend.", "ai-message", true);
            });
    }

    function appendMessage(text, className, saveState = false) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `message ${className}`;

        if (className.includes("ai-message")) {
            msgDiv.innerHTML = marked.parse(text);

            msgDiv.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);

                const pre = block.parentElement;
                if (!pre.querySelector('.copy-code-btn')) {
                    pre.style.position = 'relative';
                    const copyBtn = document.createElement("button");
                    copyBtn.className = "copy-code-btn";
                    copyBtn.textContent = "Copy";

                    copyBtn.addEventListener("click", () => {
                        navigator.clipboard.writeText(block.textContent).then(() => {
                            copyBtn.textContent = "Copied!";
                            setTimeout(() => { copyBtn.textContent = "Copy"; }, 2000);
                        });
                    });
                    pre.appendChild(copyBtn);
                }
            });
        } else {
            msgDiv.textContent = text;
        }

        messagesContainer.appendChild(msgDiv);
        scrollToBottom();

        if (saveState) {
            localStorage.setItem("nexus_chats", JSON.stringify(chats));
        }
    }

    if (sendBtn) {
        sendBtn.addEventListener("click", handleSendMessage);
    }

    if (promptInput) {
        promptInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });
    }

    switchChat(currentChatId);
});