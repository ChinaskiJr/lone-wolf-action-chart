import { useTranslation } from 'react-i18next'
import { useUIStore } from '@/store/uiStore'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const { language, setLanguage } = useUIStore()

  function toggle() {
    const next = language === 'fr' ? 'en' : 'fr'
    setLanguage(next)
    i18n.changeLanguage(next)
  }

  return (
    <button
      onClick={toggle}
      className="text-xs font-medium px-2.5 py-1 rounded border border-slate-700 text-slate-300 hover:border-amber-600 hover:text-amber-300 transition-colors"
      title="Switch language / Changer de langue"
    >
      {language === 'fr' ? 'EN' : 'FR'}
    </button>
  )
}
