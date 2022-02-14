import i18next from 'i18next';

// TODO: solve languages different?
const languages: string[] = ['de', 'en'];

export function LanguageSelector(): JSX.Element {
  return (
    <select className="bg-gray-800 text-white">
      {languages.map((lang) => <option key={lang} onClick={() => i18next.changeLanguage(lang)}>{lang}</option>)}
    </select>
  );
}