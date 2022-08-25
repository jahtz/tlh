import {Route, Routes} from 'react-router-dom';
import {
  createManuscriptUrl,
  documentMergerUrl,
  editTranscriptionDocumentUrl,
  editTransliterationDocumentUrl,
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
import {CreateManuscriptForm} from './forms/CreateManuscriptForm';
import {ManuscriptBase} from './manuscript/ManuscriptBase';
import {XmlComparator} from './xmlComparator/XmlComparator';
import {Preferences} from './Preferences';
import {DocumentMergerContainer} from './documentMerger/DocumentMergerContainer';
import {RequireAuth} from './RequireAuth';
import {NavBar} from './NavBar';
import {XmlDocumentEditorContainer} from './xmlEditor/XmlDocumentEditorContainer';
import {tlhXmlEditorConfig} from './xmlEditor/tlhXmlEditorConfig';

export function App(): JSX.Element {

  return (
    <div className="flex flex-col h-screen max-h-screen">
      <NavBar/>

      <div className="p-2 h-full max-h-full flex-auto">
        <Routes>
          <Route path={homeUrl} element={<Home/>}/>

          <Route path={registerUrl} element={<RegisterForm/>}/>

          <Route path={loginUrl} element={<LoginForm/>}/>

          <Route path={createManuscriptUrl} element={
            <RequireAuth>
              {() => <CreateManuscriptForm/>}
            </RequireAuth>
          }/>

          <Route path={`${manuscriptsUrlFragment}/:mainIdentifier/*`} element={<ManuscriptBase/>}/>

          <Route path={editTransliterationDocumentUrl} element={<XmlDocumentEditorContainer editorConfig={tlhXmlEditorConfig}/>}/>

          <Route path={editTranscriptionDocumentUrl} element={<XmlDocumentEditorContainer editorConfig={tlhXmlEditorConfig}/>}/>

          <Route path={xmlComparatorUrl} element={<XmlComparator/>}/>

          <Route path={preferencesUrl} element={<Preferences/>}/>

          <Route path={documentMergerUrl} element={<DocumentMergerContainer/>}/>
        </Routes>
      </div>
    </div>
  );
}
