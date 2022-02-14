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
    <div className="flex flex-col h-screen max-h-screen">
      <nav className="flex flex-row bg-gray-800 text-white">
        <NavLink className="p-4 hover:bg-slate-700 font-extrabold" to={homeUrl}>TLH<sup>dig</sup></NavLink>

        {user && <NavLink className="p-4 ml-4 hover:bg-slate-700" to={createManuscriptUrl}>{t('createManuscript')}</NavLink>}
        <NavLink className="p-4 ml-4 hover:bg-slate-700" to={editDocumentUrl}>{t('editDocument')}</NavLink>
        <NavLink className="p-4 ml-4 hover:bg-slate-700" to={xmlComparatorUrl}>{t('xmlComparator')}</NavLink>

        <div className="flex-grow"/>

        <NavLink className="p-4 ml-4 hover:bg-slate-700" to={preferencesUrl}>
          {/*<IoSettingsOutline/>&nbsp;*/}{t('preferences')}
        </NavLink>

        <div className="p-4 ml-4 hover:bg-slate-700">
          <LanguageSelector/>
        </div>

        {user
          ? <button className="p-4 ml-4 hover:bg-slate-700" onClick={logout}>{t('logout')} {user.name}</button>
          : <>
            <NavLink className="p-4 ml-4 hover:bg-slate-700" to={registerUrl}>{t('register')}</NavLink>
            <NavLink className="p-4 ml-4 hover:bg-slate-700" to={loginUrl}>{t('login')}</NavLink>
          </>
        }
      </nav>

      <div className="py-4 h-full max-h-full flex-auto">
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
    </div>
  );
}
