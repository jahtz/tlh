import {NavLink, useNavigate} from 'react-router-dom';
import {
  createManuscriptUrl,
  documentMergerUrl,
  editTranscriptionDocumentUrl,
  editTransliterationDocumentUrl,
  homeUrl,
  loginUrl,
  preferencesUrl,
  registerUrl,
  userManagementUrl,
  xmlComparatorUrl
} from './urls';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {activeUserSelector, logout} from './newStore';
import i18next from 'i18next';
import classNames from 'classnames';
import {Rights} from './graphql';

const languages: string[] = ['de', 'en'];

const buttonClasses = 'py-4 px-2 ml-2 hover:bg-slate-700';

export function NavBar(): JSX.Element {

  const {t} = useTranslation('common');
  const user = useSelector(activeUserSelector);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const buildDate = process.env.REACT_APP_BUILD_DATE;

  function onLogout() {
    dispatch(logout());
    navigate(loginUrl);
  }

  function changeLang(lang: string): void {
    i18next.changeLanguage(lang).catch((err) => console.error(err));
  }

  return (
    <nav className="flex flex-row bg-gray-800 text-white">
      <NavLink className="p-4 hover:bg-slate-700 font-extrabold" title={buildDate} to={homeUrl}>TLH<sup>dig</sup></NavLink>

      {user && <NavLink className={buttonClasses} to={createManuscriptUrl}>{t('createManuscript')}</NavLink>}
      <NavLink className={buttonClasses} to={editTransliterationDocumentUrl}>{t('editDocument')}</NavLink>
      <NavLink className={buttonClasses} to={editTranscriptionDocumentUrl}>{t('editTranscriptioDocument')}</NavLink>
      <NavLink className={buttonClasses} to={xmlComparatorUrl}>{t('xmlComparator')}</NavLink>
      <NavLink className={buttonClasses} to={documentMergerUrl}>{t('documentMerger')}</NavLink>

      <div className="flex-grow"/>

      <NavLink className={buttonClasses} to={preferencesUrl}>{t('preferences')}</NavLink>

      <div className="py-4 px-2">{t('language')}:</div>
      {languages.map((lang) =>
        <button type="button" onClick={() => changeLang(lang)} className={classNames('py-4 pr-2', {'font-bold': i18next.language === lang})} key={lang}>
          {lang}
        </button>)}

      {user
        ? (
          <>
            {user.rights === Rights.ExecutiveEditor && <NavLink className={buttonClasses} to={userManagementUrl}>{t('userManagement')}</NavLink>}
            <button className={buttonClasses} onClick={onLogout}>{t('logout')} {user.sub}</button>
          </>
        )
        : (
          <>
            <NavLink className={buttonClasses} to={registerUrl}>{t('register')}</NavLink>
            <NavLink className={buttonClasses} to={loginUrl}>{t('login')}</NavLink>
          </>
        )
      }
    </nav>
  );
}