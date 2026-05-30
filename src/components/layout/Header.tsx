import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'
import { WolfIcon } from './WolfIcon'

export function Header() {
  const { t } = useTranslation()
  return (
    <header className="border-b border-slate-800 bg-[#0a0a14]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <WolfIcon className="w-7 h-7 text-amber-500" />
          <span className="font-serif text-lg font-semibold text-amber-100 tracking-wide">
            {t('app.title')}
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}
