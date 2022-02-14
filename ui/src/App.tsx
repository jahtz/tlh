import {Dispatch} from 'react';
import {NavLink, Route, Routes, useNavigate} from 'react-router-dom';
import {
  createManuscriptUrl,
  documentMergerUrl,
  editDocumentUrl,
  homeUrl,
  loginUrl,
  manuscriptsUrlFragment,
  preferencesUrl,
  registerUrl,
  xmlComparatorUrl
} from './urls';
import {Home} from './Home';
import {RegisterForm} from './forms/RegisterForm';
import {LoginForm} from './forms/LoginForm';
import {useTranslation} from 'react-i18next';
import {CreateManuscriptForm} from './CreateManuscriptForm';
import {DocumentEditorContainer} from './editor/DocumentEditorContainer';
import {useDispatch, useSelector} from 'react-redux';
import {activeUserSelector} from './store/store';
import {StoreAction, userLoggedOutAction} from './store/actions';
import {ManuscriptBase} from './manuscript/ManuscriptBase';
import {XmlComparator} from './xmlComparator/XmlComparator';
import {Preferences} from './Preferences';
import {DocumentMergerContainer} from './documentMerger/DocumentMergerContainer';
import {RequireAuth} from './RequireAuth';
import {LanguageSelector} from './LanguageSelector';

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
      <nav className="p-4 flex bg-gray-800 text-white mb-4">
        <NavLink className="font-extrabold" to={homeUrl}>TLH<sup>dig</sup></NavLink>

        <div>
          {user && <NavLink className="ml-4" to={createManuscriptUrl}>{t('createManuscript')}</NavLink>}
          <NavLink className="ml-4" to={editDocumentUrl}>{t('editDocument')}</NavLink>
          <NavLink className="ml-4" to={xmlComparatorUrl}>{t('xmlComparator')}</NavLink>
        </div>

        <div className="flex-grow"/>

        <NavLink className="ml-4" to={preferencesUrl}>
          {/*<IoSettingsOutline/>&nbsp;*/}{t('preferences')}
        </NavLink>

        <div className="ml-4">
          <LanguageSelector/>
        </div>

        {user
          ? <button className="ml-4" onClick={logout}>{t('logout')} {user.name}</button>
          : <>
            <NavLink className="ml-4" to={registerUrl}>{t('register')}</NavLink>
            <NavLink className="ml-4" to={loginUrl}>{t('login')}</NavLink>
          </>
        }
      </nav>

      <div className="p-2">
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

          <Route path={documentMergerUrl} element={<DocumentMergerContainer/>}/>
        </Routes>
      </div>
    </>
  );
}
