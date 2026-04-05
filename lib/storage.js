// NutriAndré — Storage wrapper
// Reemplaza window.storage (async, Claude artifacts) por localStorage (sync)
// Guard SSR: typeof window === "undefined" para Next.js

const DB = {
  get(k) {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(k);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  set(k, v) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {
      // localStorage lleno o no disponible
    }
  },
  remove(k) {
    if (typeof window === "undefined") return;
    localStorage.removeItem(k);
  },
};

export default DB;
