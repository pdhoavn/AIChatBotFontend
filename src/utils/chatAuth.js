const CHAT_ACCESS_TOKEN_KEY = "chat_access_token";
const CHAT_TOKEN_TYPE_KEY = "chat_token_type";
const CHAT_REFRESH_TOKEN_KEY = "chat_refresh_token";

export function getChatAccessToken() {
  return localStorage.getItem(CHAT_ACCESS_TOKEN_KEY);
}

export function getAppAccessToken() {
  return localStorage.getItem("access_token");
}

export function getChatRequestToken() {
  return getChatAccessToken() || getAppAccessToken();
}

export function hasChatSession() {
  return Boolean(getChatRequestToken());
}

export function saveChatSession(data) {
  if (!data?.access_token) return;

  localStorage.setItem(CHAT_ACCESS_TOKEN_KEY, data.access_token);
  localStorage.setItem(CHAT_TOKEN_TYPE_KEY, data.token_type || "bearer");

  if (data.refresh_token) {
    localStorage.setItem(CHAT_REFRESH_TOKEN_KEY, data.refresh_token);
  }

  window.dispatchEvent(new Event("chat-auth-change"));
}

export function clearChatSession() {
  localStorage.removeItem(CHAT_ACCESS_TOKEN_KEY);
  localStorage.removeItem(CHAT_TOKEN_TYPE_KEY);
  localStorage.removeItem(CHAT_REFRESH_TOKEN_KEY);
  window.dispatchEvent(new Event("chat-auth-change"));
}
