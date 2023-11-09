import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import translateEN from "./locales/en.json";
import translateNL from "./locales/nl.json";
import translateDA from "./locales/da.json";
import translateES from "./locales/es.json";
import translateFR from "./locales/fr.json";
import translateZH from "./locales/zh.json";

i18n
    .use(Backend)
    // detect user language
    // learn more: https://github.com/i18next/i18next-browser-languageDetector
    .use(LanguageDetector)
    // pass the i18n instance to react-i18next.
    .use(initReactI18next)
    // init i18next
    // for all options read: https://www.i18next.com/overview/configuration-options
    .init({
        debug: true,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        resources: {
            en: {
                translation: translateEN
            },
            nl: {
                translation: translateNL
            },
            da: {
                translation: translateDA
            },
            es: {
                translation: translateES
            },
            fr: {
                translation: translateFR
            },
            zh: {
                translation: translateZH
            }
        }
    });

export default i18n;