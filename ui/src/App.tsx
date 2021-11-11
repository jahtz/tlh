import {Dispatch} from 'react';
import {NavLink, Route, Routes, useNavigate} from 'react-router-dom';
import {createManuscriptUrl, editDocumentUrl, homeUrl, loginUrl, manuscriptsUrlFragment, preferencesUrl, registerUrl, xmlComparatorUrl} from './urls';
import {Home} from './Home';
import {RegisterForm} from './forms/RegisterForm';
import {LoginForm} from './forms/LoginForm';
import {useTranslation} from 'react-i18next';
import i18next from 'i18next';
import {CreateManuscriptForm} from './CreateManuscriptForm';
import {DocumentEditorContainer} from './editor/DocumentEditorContainer';
import {useDispatch, useSelector} from 'react-redux';
import {activeUserSelector} from './store/store';
import {StoreAction, userLoggedOutAction} from './store/actions';
import {ManuscriptBase} from './manuscript/ManuscriptBase';
import {XmlComparator} from './xmlComparator/XmlComparator';
import {Preferences} from './Preferences';
import {IoSettingsOutline} from 'react-icons/io5';
import {RequireAuth} from './RequireAuth';

// TODO: solve languages different?
const languages: string[] = ['de', 'en'];

export function App(): JSX.Element {

  const {t} = useTranslation('common');
  const dispatch = useDispatch<Dispatch<StoreAction>>();
  const user = useSelector(activeUserSelector);
  const navigate = useNavigate();

  function logout() {
    dispatch(userLoggedOutAction);
    navigate(loginUrl);
  }

  return (
    <>
      <nav className="navbar is-dark">
        <div className="navbar-brand">
          <NavLink className="navbar-item" to={homeUrl}>TLH<sup>dig</sup></NavLink>
        </div>
        <div className="navbar-menu">
          <div className="navbar-start">
            {user && <NavLink className="navbar-item" to={createManuscriptUrl}>{t('createManuscript')}</NavLink>}
            <NavLink className="navbar-item" to={editDocumentUrl}>{t('editDocument')}</NavLink>
            <NavLink className="navbar-item" to={xmlComparatorUrl}>{t('xmlComparator')}</NavLink>
          </div>

          <div className="navbar-end">
            <NavLink className="navbar-item" to={preferencesUrl}><IoSettingsOutline/>&nbsp;{t('preferences')}</NavLink>
            <div className="navbar-item has-dropdown is-hoverable">
              <div className="navbar-link">{t('language')}</div>
              <div className="navbar-dropdown">
                {languages.map((lang) =>
                  <div className="navbar-item" key={lang} onClick={() => i18next.changeLanguage(lang)}>{lang}</div>
                )}
              </div>
            </div>
            <div className="navbar-item">
              {user
                ? <div className="buttons">
                  <button className="button is-light" onClick={logout}>{t('logout')} {user.name}</button>
                </div>
                : <div className="buttons">
                  <NavLink className="button is-light" to={registerUrl}>{t('register')}</NavLink>
                  <NavLink className="button is-light" to={loginUrl}>{t('login')}</NavLink>
                </div>
              }
            </div>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path={homeUrl} element={<Home/>}/>

        <Route path={registerUrl} element={<RegisterForm/>}/>

        <Route path={loginUrl} element={<LoginForm/>}/>

        <Route path={createManuscriptUrl} element={
          <RequireAuth>
            {() => <CreateManuscriptForm/>}
          </RequireAuth>
        }/>

        <Route path={`/${manuscriptsUrlFragment}/:mainIdentifier`} element={<ManuscriptBase/>}/>

        <Route path={editDocumentUrl} element={<DocumentEditorContainer/>}/>

        <Route path={xmlComparatorUrl} element={<XmlComparator/>}/>

        <Route path={preferencesUrl} element={<Preferences/>}/>
      </Routes>
    </>
  );
}
