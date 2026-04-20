// Minimal i18n helper. Does not add external deps and works at build time.
// Usage: import { t, locale, setLocale } from 'src/utils/i18n'
import vi from '../locales/vi.json';

const messages = {
  vi
};

// Default locale: read from Vite env VITE_LOCALE, window.__LOCALE__ or fallback to 'vi'
let currentLocale = (typeof window !== 'undefined' && window.__LOCALE__) || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_LOCALE) || 'vi';

export function setLocale(loc) {
  if (!messages[loc]) {
    currentLocale = 'vi';
    return;
  }
  currentLocale = loc;
  try {
    if (typeof window !== 'undefined') window.__LOCALE__ = loc;
  } catch (e) {
    // ignore
  }
}

export function locale() {
  return currentLocale;
}

// t supports namespaced keys like 'common.save' and an optional replacements object for templating
export function t(key, replacements = {}) {
  if (!key) return '';
  const ns = key.split('.');
  let node = messages[currentLocale];
  for (let i = 0; i < ns.length; i++) {
    if (!node) break;
    node = node[ns[i]];
  }
  let out = node || key;
  // simple replacement: {{name}}
  Object.keys(replacements || {}).forEach(k => {
    const re = new RegExp(`{{\\s*${k}\\s*}}`, 'g');
    out = out.replace(re, replacements[k]);
  });
  return out;
}

export default { t, locale, setLocale };
