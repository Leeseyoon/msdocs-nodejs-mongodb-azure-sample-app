// 페이지 로드 시 채팅 기록 불러오기
window.addEventListener('load', function() {
  loadChatHistory();
});

function loadChatHistory() {
  fetch('/api/chat/history')
    .then(response => response.json())
    .then(history => {
      const messages = document.getElementById('chat-messages');
      messages.innerHTML = ''; // 기존 메시지 클리어

      history.forEach(chat => {
        addMessage(chat.type, chat.message);
      });
    })
    .catch(error => {
      console.error('채팅 기록 로드 중 오류:', error);
    });
}

document.getElementById('chat-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const messageInput = document.getElementById('message');
  const message = messageInput.value;

  if (message.trim()) {
    // 메시지 표시
    addMessage('user', message);

    // API 호출
    fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message })
    })
    .then(response => response.json())
    .then(data => {
      addMessage('bot', data.reply);
    })
    .catch(error => {
      console.error('메시지 전송 중 오류:', error);
    });

    messageInput.value = '';
  }
});

function addMessage(type, text) {
  const messages = document.getElementById('chat-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = text;
  messages.appendChild(messageDiv);
  messages.scrollTop = messages.scrollHeight;
}