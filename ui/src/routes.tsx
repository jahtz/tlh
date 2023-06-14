import {createBrowserRouter, LoaderFunctionArgs, useRouteError} from 'react-router-dom';
import {JSX} from 'react';
import {
  approveDocumentUrl,
  createManuscriptUrl,
  createTransliterationUrl,
  documentMergerUrl,
  editTranscriptionDocumentUrl,
  editTransliterationDocumentUrl,
  firstXmlReviewUrl,
  homeUrl,
  loginUrl,
  pipelineManagementUrl,
  preferencesUrl,
  registerUrl,
  secondXmlReviewUrl,
  transliterationReviewUrl,
  uploadPicturesUrl,
  userManagementUrl,
  xmlComparatorUrl,
  xmlConversionUrl
} from './urls';
import {RegisterForm} from './forms/RegisterForm';
import {Home} from './Home';
import {App} from './App';
import {LoginForm} from './forms/LoginForm';
import {RequireAuth} from './RequireAuth';
import {CreateManuscriptForm} from './forms/CreateManuscriptForm';
import {StandAloneOXTED} from './xmlEditor/StandAloneOXTED';
import {DocumentMergerContainer} from './documentMerger/DocumentMergerContainer';
import {tlhXmlEditorConfig} from './xmlEditor/tlhXmlEditorConfig';
import {Preferences} from './Preferences';
import {XmlComparatorContainer} from './xmlComparator/XmlComparatorContainer';
import {ManuscriptDocument, ManuscriptMetaDataFragment, ManuscriptQuery, ManuscriptQueryVariables, Rights, XmlReviewType} from './graphql';
import {apolloClient} from './apolloClient';
import {OperationVariables, TypedDocumentNode} from '@apollo/client';
import {ManuscriptData} from './manuscript/ManuscriptData';
import {UploadPicturesForm} from './manuscript/UploadPicturesForm';
import {TransliterationInput} from './manuscript/TransliterationInput';
import {UserManagement} from './UserManagement';
import {TransliterationReview} from './manuscript/TransliterationReview';
import {XmlConversion} from './manuscript/xmlConversion/XmlConversion';
import {PipelineOverview} from './pipeline/PipelineOverview';
import {XmlReview} from './manuscript/review/XmlReview';
import {DocumentApproval} from './manuscript/DocumentApproval';

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
        {path: userManagementUrl, element: <RequireAuth minRights={Rights.ExecutiveEditor}>{() => <UserManagement/>}</RequireAuth>},

        {path: createManuscriptUrl, element: <RequireAuth>{() => <CreateManuscriptForm/>}</RequireAuth>},

        {path: pipelineManagementUrl, element: <RequireAuth minRights={Rights.ExecutiveEditor}>{() => <PipelineOverview/>}</RequireAuth>},

        {
          path: 'manuscripts/:mainIdentifier', children: [
            {path: 'data', element: <ManuscriptData/>, loader: manuscriptDataLoader},
            {path: uploadPicturesUrl, element: <RequireAuth>{() => <UploadPicturesForm/>}</RequireAuth>, loader: manuscriptDataLoader},
            {
              path: createTransliterationUrl,
              element: <RequireAuth minRights={Rights.Reviewer}>{() => <TransliterationInput/>}</RequireAuth>,
              loader: manuscriptDataLoader
            },
            {path: transliterationReviewUrl, element: <RequireAuth minRights={Rights.Reviewer}>{() => <TransliterationReview/>}</RequireAuth>},
            {path: xmlConversionUrl, element: <RequireAuth minRights={Rights.Reviewer}>{() => <XmlConversion/>}</RequireAuth>},
            {
              path: firstXmlReviewUrl,
              element: <RequireAuth minRights={Rights.Reviewer}>{() => <XmlReview reviewType={XmlReviewType.FirstXmlReview}/>}</RequireAuth>
            },
            {
              path: secondXmlReviewUrl,
              element: <RequireAuth minRights={Rights.Reviewer}>{() => <XmlReview reviewType={XmlReviewType.SecondXmlReview}/>}</RequireAuth>
            },
            {path: approveDocumentUrl, element: <RequireAuth minRights={Rights.ExecutiveEditor}>{() => <DocumentApproval/>}</RequireAuth>}
          ]
        },

        {path: editTransliterationDocumentUrl, element: <StandAloneOXTED editorConfig={tlhXmlEditorConfig} documentType={'transliteration'}/>},
        {path: editTranscriptionDocumentUrl, element: <StandAloneOXTED editorConfig={tlhXmlEditorConfig} documentType={'transcription'}/>},

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