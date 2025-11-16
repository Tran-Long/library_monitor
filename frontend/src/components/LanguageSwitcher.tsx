import { useLanguage } from '../contexts/LanguageContext'

export const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">{t('language')}:</span>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded text-sm font-medium transition ${
          language === 'en'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('vi')}
        className={`px-3 py-1 rounded text-sm font-medium transition ${
          language === 'vi'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        VI
      </button>
    </div>
  )
}
