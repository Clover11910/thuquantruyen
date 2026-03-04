const API_URL = process.env.NEXT_PUBLIC_GAS_URL;

class ApiClient {
  constructor() {
    this.baseUrl = API_URL;
  }

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  async request(action, params = {}) {
    const token = this.getToken();
    const body = { action, ...params };
    if (token) body.token = token;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(body),
      });

      // GAS redirects, so we handle it
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        // Nếu GAS redirect, fetch lại
        const redirectResponse = await fetch(response.url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(body),
        });
        const redirectText = await redirectResponse.text();
        return JSON.parse(redirectText);
      }
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: 'Lỗi kết nối server' };
    }
  }

  // === AUTH ===
  async login(username, password) {
    return this.request('login', { username, password });
  }

  async logout() {
    const result = await this.request('logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    return result;
  }

  async validateToken() {
    return this.request('validateToken');
  }

  // === ADMIN: USERS ===
  async createUser(username, password, displayName) {
    return this.request('createUser', { username, password, displayName });
  }

  async listUsers() {
    return this.request('listUsers');
  }

  async deleteUser(userId) {
    return this.request('deleteUser', { userId });
  }

  // === ADMIN: STORIES ===
  async createStory(data) {
    return this.request('createStory', data);
  }

  async uploadChapter(storyId, chapterNumber, chapterTitle, content) {
    return this.request('uploadChapter', { storyId, chapterNumber, chapterTitle, content });
  }

  async uploadZip(storyId, zipBase64) {
    return this.request('uploadZip', { storyId, zipBase64 });
  }

  async listAllStories() {
    return this.request('listAllStories');
  }

  async deleteStory(storyId) {
    return this.request('deleteStory', { storyId });
  }

  // === ADMIN: GRANT ===
  async grantStory(userId, storyId) {
    return this.request('grantStory', { userId, storyId });
  }

  async revokeStory(userId, storyId) {
    return this.request('revokeStory', { userId, storyId });
  }

  async getUserStories(userId) {
    return this.request('getUserStories', { userId });
  }

  // === USER: LIBRARY ===
  async getMyLibrary() {
    return this.request('getMyLibrary');
  }

  async getStoryDetail(storyId) {
    return this.request('getStoryDetail', { storyId });
  }

  async getChapterList(storyId) {
    return this.request('getChapterList', { storyId });
  }

  async getChapterContent(storyId, chapterNumber) {
    return this.request('getChapterContent', { storyId, chapterNumber });
  }

  // === USER: PROGRESS ===
  async saveProgress(storyId, lastChapter, scrollPosition) {
    return this.request('saveProgress', { storyId, lastChapter, scrollPosition });
  }

  async getProgress(storyId) {
    return this.request('getProgress', { storyId });
  }

  // === USER: SETTINGS ===
  async saveSettings(settings) {
    return this.request('saveSettings', settings);
  }

  async getSettings() {
    return this.request('getSettings');
  }

  // === USER: OFFLINE ===
  async downloadForOffline(storyId) {
    return this.request('downloadForOffline', { storyId });
  }

  async getOfflineBooks() {
    return this.request('getOfflineBooks');
  }

  async getOfflineContent(storyId) {
    return this.request('getOfflineContent', { storyId });
  }

  async removeOfflineBook(storyId) {
    return this.request('removeOfflineBook', { storyId });
  }
}

const api = new ApiClient();
export default api;