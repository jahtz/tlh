import {Navigate, Route, Routes, useParams} from 'react-router-dom';
import {ManuscriptData} from './ManuscriptData';
import {ManuscriptMetaDataFragment, useManuscriptQuery} from '../graphql';
import {WithQuery} from '../WithQuery';
import {homeUrl} from '../urls';
import {UploadPicturesForm} from './UploadPicturesForm';
import {TransliterationInput} from './TransliterationInput';
import {WithNullableNavigate} from '../WithNullableNavigate';

export interface ManuscriptBaseIProps {
  manuscript: ManuscriptMetaDataFragment;
}

export const uploadPicturesUrl = 'uploadPictures';
export const createTransliterationUrl = 'createTransliteration';

// URL: /manuscripts/:mainIdentifier
export function ManuscriptBase(): JSX.Element {

  const params = useParams<'mainIdentifier'>();

  if (!params.mainIdentifier) {
    return <Navigate to={homeUrl}/>;
  }

  const manuscriptQuery = useManuscriptQuery({variables: {mainIdentifier: decodeURIComponent(params.mainIdentifier)}});

  return (
    <WithQuery query={manuscriptQuery}>
      {({manuscript: maybeManuscript}) => <WithNullableNavigate t={maybeManuscript}>
        {(manuscript) => <Routes>
          <Route path={'/data'} element={<ManuscriptData manuscript={manuscript}/>}/>
          <Route path={uploadPicturesUrl} element={<UploadPicturesForm manuscript={manuscript}/>}/>
          <Route path={`/${createTransliterationUrl}`} element={<TransliterationInput manuscript={manuscript}/>}/>
        </Routes>}
      </WithNullableNavigate>}
    </WithQuery>
  );
}
