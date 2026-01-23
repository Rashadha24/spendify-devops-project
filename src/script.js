/**
 * Spendify Storage Engine
 * Handles all JSON parsing and stringifying for LocalStorage.
 */

const StorageEngine = {
  // Save data to a specific key
  save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  // Load data from a key, or return a default value
  load(key, defaultValue = null) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  },

  // Specific helper for transactions (organized by user email)
  getUserTransactions(email) {
    const all = this.load('spendify_txns_v3', {});
    return all[email] || [];
  },

  // Specific helper to save transactions for a user
  setUserTransactions(email, txns) {
    const all = this.load('spendify_txns_v3', {});
    all[email] = txns;
    this.save('spendify_txns_v3', all);
  },

  // Clear current session
  clearSession() {
    localStorage.removeItem('spendify_session_v1');
  }
};

// Make it globally accessible
window.DB = StorageEngine;