import i18n from "i18next";
import detector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import translationGr from "../../resources/js/locales/gr.json";
import translationIT from "../../resources/js/locales/it.json";
import translationRS from "../../resources/js/locales/ru.json";
import translationSP from "../../resources/js/locales/sp.json";
import translationENG from "../../resources/js/locales/en.json";
import translationCN from "../../resources/js/locales/ch.json";
import translationFR from "../../resources/js/locales/fr.json";
import translationAR from "../../resources/js/locales/ar.json";

// the translations
const resources = {
  gr: {
    translation: translationGr,
  },
  it: {
    translation: translationIT,
  },
  rs: {
    translation: translationRS,
  },
  sp: {
    translation: translationSP,
  },
  en: {
    translation: translationENG,
  },
  cn: {
    translation: translationCN,
  },
  fr: {
    translation: translationFR,
  },
  ar: {
    translation: translationAR,
  },  
};

const language = localStorage.getItem("I18N_LANGUAGE");
if (!language) {
  localStorage.setItem("I18N_LANGUAGE", "en");
}

i18n
  .use(detector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: localStorage.getItem("I18N_LANGUAGE") || "en",
    fallbackLng: "en", // use en if detected lng is not available

    keySeparator: false, // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
