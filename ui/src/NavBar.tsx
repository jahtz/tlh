import {NavLink, useNavigate} from 'react-router-dom';
import {
  createManuscriptUrl,
  editTranscriptionDocumentUrl,
  editTransliterationDocumentUrl,
  homeUrl,
  loginUrl,
  preferencesUrl,
  registerUrl,
  xmlComparatorUrl
} from './urls';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {activeUserSelector, logout} from './newStore';
import i18next from 'i18next';
import classNames from 'classnames';

const languages: string[] = ['de', 'en'];

export function NavBar(): JSX.Element {

  const {t} = useTranslation('common');
  const user = useSelector(activeUserSelector);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function onLogout() {
    dispatch(logout());
    navigate(loginUrl);
  }

  function changeLang(lang: string): void {
    i18next.changeLanguage(lang).catch((err) => console.error(err));
  }

  return (
    <nav className="flex flex-row bg-gray-800 text-white">
      <NavLink className="p-4 hover:bg-slate-700 font-extrabold" to={homeUrl}>TLH<sup>dig</sup></NavLink>

      {user && <NavLink className="p-4 ml-4 hover:bg-slate-700" to={createManuscriptUrl}>{t('createManuscript')}</NavLink>}
      <NavLink className="p-4 ml-4 hover:bg-slate-700" to={editTransliterationDocumentUrl}>{t('editDocument')}</NavLink>
      <NavLink className="p-4 ml-2 hover:bg-slate-700" to={editTranscriptionDocumentUrl}>{t('editTranscriptioDocument')}</NavLink>
      <NavLink className="p-4 ml-4 hover:bg-slate-700" to={xmlComparatorUrl}>{t('xmlComparator')}</NavLink>

      <div className="flex-grow"/>

      <NavLink className="p-4 ml-4 hover:bg-slate-700" to={preferencesUrl}>{t('preferences')}</NavLink>

      <div className="p-4">{t('language')}:</div>
      {languages.map((lang) => <button type="button" onClick={() => changeLang(lang)}
                                       className={classNames('py-4 pr-2', {'font-bold': i18next.language === lang})} key={lang}>{lang}</button>)}

      {user
        ? <button className="p-4 ml-4 hover:bg-slate-700" onClick={onLogout}>{t('logout')} {user.user_id}</button>
        : (
          <>
            <NavLink className="p-4 ml-4 hover:bg-slate-700" to={registerUrl}>{t('register')}</NavLink>
            <NavLink className="p-4 ml-4 hover:bg-slate-700" to={loginUrl}>{t('login')}</NavLink>
          </>
        )
      }
    </nav>
  );
}