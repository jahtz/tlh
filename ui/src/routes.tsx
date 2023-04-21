import {createBrowserRouter, LoaderFunctionArgs, useRouteError} from 'react-router-dom';
import {
  createManuscriptUrl,
  createTransliterationUrl,
  documentMergerUrl,
  editTranscriptionDocumentUrl,
  editTransliterationDocumentUrl,
  homeUrl,
  loginUrl,
  preferencesUrl,
  registerUrl,
  uploadPicturesUrl,
  userManagementUrl,
  xmlComparatorUrl
} from './urls';
import {RegisterForm} from './forms/RegisterForm';
import {Home} from './Home';
import {App} from './App';
import {LoginForm} from './forms/LoginForm';
import {RequireAuth} from './RequireAuth';
import {CreateManuscriptForm} from './forms/CreateManuscriptForm';
import {XmlDocumentEditorContainer} from './xmlEditor/XmlDocumentEditorContainer';
import {DocumentMergerContainer} from './documentMerger/DocumentMergerContainer';
import {tlhXmlEditorConfig} from './xmlEditor/tlhXmlEditorConfig';
import {Preferences} from './Preferences';
import {XmlComparatorContainer} from './xmlComparator/XmlComparatorContainer';
import {ManuscriptDocument, ManuscriptMetaDataFragment, ManuscriptQuery, ManuscriptQueryVariables} from './graphql';
import {apolloClient} from './apolloClient';
import {OperationVariables, TypedDocumentNode} from '@apollo/client';
import {ManuscriptData} from './manuscript/ManuscriptData';
import {UploadPicturesForm} from './manuscript/UploadPicturesForm';
import {TransliterationInput} from './manuscript/TransliterationInput';
import {UserManagement} from './UserManagement';

async function apolloLoader<T, V extends OperationVariables>(query: TypedDocumentNode<T, V>, variables: V): Promise<T | undefined> {
  return apolloClient
    .query<T, V>({query, variables})
    .then(({data}) => data || undefined);
}

async function manuscriptDataLoader({params}: LoaderFunctionArgs): Promise<ManuscriptMetaDataFragment | undefined> {
  return params.mainIdentifier
    ? await apolloLoader<ManuscriptQuery, ManuscriptQueryVariables>(ManuscriptDocument, {mainIdentifier: params.mainIdentifier})
      .then((data) => data?.manuscript || undefined)
    : undefined;
}

const routerOptions = {
  basename: process.env.NODE_ENV !== 'development'
    ? `/${process.env.REACT_APP_VERSION}/public`
    : '',
};

export const router = createBrowserRouter([
    {
      path: '/',
      element: <App/>,
      children: [
        {path: homeUrl, element: <Home/>},

        {path: registerUrl, element: <RegisterForm/>},
        {path: loginUrl, element: <LoginForm/>},
        {path: userManagementUrl, element: <UserManagement/>},

        {path: createManuscriptUrl, element: <RequireAuth>{() => <CreateManuscriptForm/>}</RequireAuth>},

        {
          path: 'manuscripts/:mainIdentifier',
          children: [
            {path: 'data', element: <ManuscriptData/>, loader: manuscriptDataLoader},
            {path: uploadPicturesUrl, element: <UploadPicturesForm/>, loader: manuscriptDataLoader},
            {path: createTransliterationUrl, element: <TransliterationInput/>, loader: manuscriptDataLoader},
          ]
        },

        {path: editTransliterationDocumentUrl, element: <XmlDocumentEditorContainer editorConfig={tlhXmlEditorConfig}/>},

        {path: editTranscriptionDocumentUrl, element: <XmlDocumentEditorContainer editorConfig={tlhXmlEditorConfig}/>},

        {path: xmlComparatorUrl, element: <XmlComparatorContainer/>},

        {path: preferencesUrl, element: <Preferences/>},

        {path: documentMergerUrl, element: <DocumentMergerContainer/>},
      ],
      errorElement: <ErrorBoundary/>
    }
  ],
  routerOptions
);

function ErrorBoundary(): JSX.Element {

  const error = useRouteError();
  console.error(error);

  return (
    <div>Error...</div>
  );
}