// Browser fallback for the `window.storage` API the app was originally written
// against. Keeps App.jsx unmodified; install this before React mounts.
if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    async get(key) {
      const value = window.localStorage.getItem(key);
      return value === null ? null : { value };
    },
    async set(key, value) {
      window.localStorage.setItem(key, value);
    },
  };
}
