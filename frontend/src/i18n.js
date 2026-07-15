// i18n setup. kk.json is a machine/draft translation — NOT reviewed by a native Kazakh
// speaker yet. It covers all static frontend UI chrome (nav, forms, labels, buttons,
// empty states). It intentionally does NOT cover: validation/error messages from the
// backend API (always Russian), or clinical data itself (patient names, diagnosis text,
// analysis type names, medical range labels) — that data is entered/stored in Russian
// regardless of the UI language. See README "Локализация" before treating this as
// production-ready for Kazakh users.
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './locales/ru.json';
import kk from './locales/kk.json';

const STORAGE_KEY = 'saruar-lang';

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    kk: { translation: kk },
  },
  lng: localStorage.getItem(STORAGE_KEY) || 'ru',
  fallbackLng: 'ru',
  interpolation: { escapeValue: false },
});

export function setLanguage(lng) {
  i18n.changeLanguage(lng);
  localStorage.setItem(STORAGE_KEY, lng);
}

export default i18n;
