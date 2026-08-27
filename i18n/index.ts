import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: { translation: { welcome: 'Welcome', submit: 'Submit' } },
  zh: { translation: { welcome: '欢迎', submit: '提交' } }
}

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
})

export default i18n
