import {createBrowserRouter, useRouteError} from 'react-router-dom';
import {JSX} from 'react';
import {
  approveDocumentUrl,
  baseUrl,
  createManuscriptUrl,
  createTransliterationUrl,
  documentMergerUrl,
  firstXmlReviewUrl,
  homeUrl,
  loginUrl,
  oxtedUrl,
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
import {Rights, XmlReviewType} from './graphql';
import {ManuscriptData} from './manuscript/ManuscriptData';
import {UploadPicturesForm} from './manuscript/UploadPicturesForm';
import {TransliterationInputContainer} from './manuscript/TransliterationInput';
import {UserManagement} from './UserManagement';
import {TransliterationReview} from './manuscript/TransliterationReview';
import {XmlConversion} from './manuscript/xmlConversion/XmlConversion';
import {PipelineOverview} from './pipeline/PipelineOverview';
import {XmlReview} from './manuscript/review/XmlReview';
import {DocumentApproval} from './manuscript/DocumentApproval';

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
            {path: 'data', element: <ManuscriptData/>},
            {path: uploadPicturesUrl, element: <RequireAuth>{() => <UploadPicturesForm/>}</RequireAuth>},
            {
              path: createTransliterationUrl,
              element: <RequireAuth>{(currentUser) => <TransliterationInputContainer currentUser={currentUser}/>}</RequireAuth>
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

        {path: oxtedUrl, element: <StandAloneOXTED editorConfig={tlhXmlEditorConfig}/>},

        {path: xmlComparatorUrl, element: <XmlComparatorContainer/>},

        {path: preferencesUrl, element: <Preferences/>},

        {path: documentMergerUrl, element: <DocumentMergerContainer/>},
      ],
      errorElement: <ErrorBoundary/>
    }
  ],
  {
    basename: baseUrl
  }
);

function ErrorBoundary(): JSX.Element {

  const error = useRouteError();
  console.error(error);

  return (
    <div>Error...</div>
  );
}