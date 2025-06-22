// chat.js - Chat functionality
// 使用全局路徑配置 (由 pathManager 設置)

let currentConversationId = null;
let currentUserId = null;
let refreshInterval = null;

// DOM Elements
const conversationsList = document.getElementById('conversations-list');
const chatArea = document.getElementById('chat-area');
const chatPlaceholder = document.getElementById('chat-placeholder');
const chatHeader = document.getElementById('chat-header');
const chatTitle = document.getElementById('chat-title');
const messagesContainer = document.getElementById('messages-container');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const newChatBtn = document.getElementById('new-chat-btn');
const newChatModal = document.getElementById('new-chat-modal');
const friendSelect = document.getElementById('friend-select');
const startNewChatBtn = document.getElementById('start-new-chat');
const cancelNewChatBtn = document.getElementById('cancel-new-chat');

// 工具函數
const formatTime = (dateString) => {
  try {
    // 處理各種時間格式
    let date;
    if (dateString.includes('T')) {
      // ISO 8601 格式，可能包含時區信息
      date = new Date(dateString);
    } else {
      // 其他格式
      date = new Date(dateString);
    }
    
    // 驗證日期是否有效
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return '無效時間';
    }
    
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    // 如果是今天
    if (diffDays === 0) {
      if (diffMinutes < 1) {
        return '剛剛';
      } else if (diffMinutes < 60) {
        return `${diffMinutes}分鐘前`;
      } else if (diffHours < 24) {
        return date.toLocaleTimeString('zh-TW', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false, 
        });
      }
    } 
    // 如果是昨天
    else if (diffDays === 1) {
      return `昨天 ${date.toLocaleTimeString('zh-TW', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false, 
      })}`;
    } 
    // 如果是這週內
    else if (diffDays < 7) {
      const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
      return `${weekdays[date.getDay()]} ${date.toLocaleTimeString('zh-TW', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false, 
      })}`;
    } 
    // 如果是今年
    else if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('zh-TW', { 
        month: 'numeric', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }
    // 更早的時間
    else {
      return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });
    }
  } catch (error) {
    console.error('Error formatting time:', error, 'for dateString:', dateString);
    return '時間錯誤';
  }
};

const scrollToBottom = () => {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

// API 函數
const fetchConversations = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${getApiBaseUrl()}/chat/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const conversations = await response.json();
      displayConversations(conversations);
    } else {
      conversationsList.innerHTML =
        '<div class="p-4 text-center text-red-500">載入聊天列表失敗</div>';
    }
  } catch (error) {
    console.error('Error fetching conversations:', error);
    conversationsList.innerHTML = '<div class="p-4 text-center text-red-500">網路錯誤</div>';
  }
};

const fetchMessages = async (conversationId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(
      `${getApiBaseUrl()}/chat/conversations/${conversationId}/messages`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (response.ok) {
      const data = await response.json();
      displayMessages(data.messages);
    } else {
      messagesContainer.innerHTML = '<div class="text-center text-red-500">載入消息失敗</div>';
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    messagesContainer.innerHTML = '<div class="text-center text-red-500">網路錯誤</div>';
  }
};

const sendMessage = async (conversationId, content) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(
      `${getApiBaseUrl()}/chat/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      },
    );

    if (response.ok) {
      const message = await response.json();
      addMessageToChat(message);
      scrollToBottom();
      // 刷新聊天列表來更新最後消息
      fetchConversations();
    } else {
      const error = await response.json();
      alert(`發送失敗: ${error.message}`);
    }
  } catch (error) {
    console.error('Error sending message:', error);
    alert('發送消息時發生錯誤');
  }
};

const createConversation = async (friendId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${getApiBaseUrl()}/chat/conversations/${friendId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const data = await response.json();
      return data.conversation_id;
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

const fetchFriends = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${getApiBaseUrl()}/friends`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const friends = await response.json();
      populateFriendSelect(friends);
    } else {
      alert('載入好友列表失敗');
    }
  } catch (error) {
    console.error('Error fetching friends:', error);
    alert('載入好友列表時發生錯誤');
  }
};

// 顯示函數
const displayConversations = (conversations) => {
  if (conversations.length === 0) {
    conversationsList.innerHTML = `
            <div class="p-4 text-center text-gray-500">
                <p>還沒有聊天記錄</p>
                <p class="text-sm mt-2">點擊右下角的 + 按鈕開始新聊天</p>
            </div>
        `;
    return;
  }

  conversationsList.innerHTML = conversations
    .map(
      (conv) => `
        <div
            class="conversation-item p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${currentConversationId === conv.id ? 'bg-indigo-50' : ''}"
            data-conversation-id="${conv.id}"
            data-other-user="${conv.other_user.username}"
        >
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-900">${conv.other_user.username}</h4>
                    <p class="text-sm text-gray-600 truncate">
                        ${conv.last_message ? conv.last_message.content : '開始聊天...'}
                    </p>
                </div>
                <div class="ml-2 text-right">
                    <span class="text-xs text-gray-500">
                        ${conv.last_message ? formatTime(conv.last_message.created_at) : formatTime(conv.updated_at)}
                    </span>
                    ${
                      conv.unread_count > 0
                        ? `
                        <div class="mt-1">
                            <span class="inline-block px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                                ${conv.unread_count}
                            </span>
                        </div>
                    `
                        : ''
                    }
                </div>
            </div>
        </div>
    `,
    )
    .join('');

  // 添加點擊事件
  document.querySelectorAll('.conversation-item').forEach((item) => {
    item.addEventListener('click', () => {
      const conversationId = parseInt(item.dataset.conversationId);
      const otherUser = item.dataset.otherUser;
      selectConversation(conversationId, otherUser);
    });
  });
};

const displayMessages = (messages) => {
  if (messages.length === 0) {
    messagesContainer.innerHTML = '<div class="text-center text-gray-500">開始聊天吧！</div>';
    return;
  }

  messagesContainer.innerHTML = messages
    .map((message) => {
      const isOwnMessage = message.sender_id === currentUserId;
      return `
            <div class="message ${isOwnMessage ? 'text-right' : 'text-left'}">
                <div class="inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwnMessage ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-900'
                }">
                    <p class="text-sm">${message.content}</p>
                    <p class="text-xs mt-1 ${isOwnMessage ? 'text-indigo-200' : 'text-gray-500'}">
                        ${formatTime(message.created_at)}
                    </p>
                </div>
            </div>
        `;
    })
    .join('');

  scrollToBottom();
};

const addMessageToChat = (message) => {
  const isOwnMessage = message.sender_id === currentUserId;
  const messageElement = document.createElement('div');
  messageElement.className = `message ${isOwnMessage ? 'text-right' : 'text-left'}`;
  messageElement.innerHTML = `
        <div class="inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwnMessage ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-900'
        }">
            <p class="text-sm">${message.content}</p>
            <p class="text-xs mt-1 ${isOwnMessage ? 'text-indigo-200' : 'text-gray-500'}">
                ${formatTime(message.created_at)}
            </p>
        </div>
    `;
  messagesContainer.appendChild(messageElement);
};

const populateFriendSelect = (friends) => {
  friendSelect.innerHTML =
    '<option value="">選擇好友...</option>' +
    friends.map((friend) => `<option value="${friend.id}">${friend.username}</option>`).join('');
};

const selectConversation = (conversationId, otherUser) => {
  currentConversationId = conversationId;

  // 更新UI
  document.querySelectorAll('.conversation-item').forEach((item) => {
    item.classList.remove('bg-indigo-50');
  });
  document
    .querySelector(`[data-conversation-id="${conversationId}"]`)
    .classList.add('bg-indigo-50');

  // 顯示聊天區域
  chatPlaceholder.classList.add('hidden');
  chatArea.classList.remove('hidden');
  chatHeader.classList.remove('hidden');
  chatTitle.textContent = otherUser;

  // 載入消息
  fetchMessages(conversationId);

  // 開始自動刷新消息
  startMessageRefresh();
};

const startMessageRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  refreshInterval = setInterval(() => {
    if (currentConversationId) {
      fetchMessages(currentConversationId);
    }
  }, 3000); // 每3秒刷新一次
};

const stopMessageRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

// 導航欄功能
// updateNavbar function is now handled by auth.js to avoid conflicts

// 事件監聽器
document.addEventListener('DOMContentLoaded', () => {
  // 檢查認證
  const token = localStorage.getItem('token');
  if (!token) {
    alert('你必須登入才能使用聊天功能');
    RouteUtils.redirectToLogin();
    return;
  }

  // 獲取當前用戶ID
  currentUserId = parseInt(localStorage.getItem('userId'));

  // 更新導航欄 (wait for auth.js if needed)
  const tryUpdateNavbar = () => {
    if (typeof updateNavbar === 'function') {
      updateNavbar();
    } else {
      // Wait a bit for auth.js to load and try again
      setTimeout(tryUpdateNavbar, 50);
    }
  };
  tryUpdateNavbar();

  // 載入聊天列表
  fetchConversations();

  // 消息表單提交
  messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = messageInput.value.trim();

    if (!content || !currentConversationId) return;

    messageInput.value = '';
    await sendMessage(currentConversationId, content);
  });

  // 新聊天按鈕
  newChatBtn.addEventListener('click', async () => {
    await fetchFriends();
    newChatModal.classList.remove('hidden');
  });

  // 取消新聊天
  cancelNewChatBtn.addEventListener('click', () => {
    newChatModal.classList.add('hidden');
  });

  // 開始新聊天
  startNewChatBtn.addEventListener('click', async () => {
    const friendId = friendSelect.value;
    if (!friendId) {
      alert('請選擇好友');
      return;
    }

    try {
      const conversationId = await createConversation(friendId);
      newChatModal.classList.add('hidden');

      // 刷新聊天列表
      await fetchConversations();

      // 選擇新創建的聊天
      const friendName = friendSelect.options[friendSelect.selectedIndex].text;
      selectConversation(conversationId, friendName);
    } catch (error) {
      alert(`創建聊天失敗: ${error.message}`);
    }
  });

  // 點擊模態框外部關閉
  newChatModal.addEventListener('click', (e) => {
    if (e.target === newChatModal) {
      newChatModal.classList.add('hidden');
    }
  });
});

// 頁面離開時停止刷新
window.addEventListener('beforeunload', () => {
  stopMessageRefresh();
});

// 獲取 API_BASE_URL 的函數
function getApiBaseUrl() {
  const apiBase = window.ROUTES ? window.ROUTES.api.base : '';
  return `${apiBase}/api`;
}
