import {Navigate, Route, Routes, useParams} from 'react-router-dom';
import {ManuscriptData} from './ManuscriptData';
import {ManuscriptMetaDataFragment, ManuscriptQuery, useManuscriptQuery} from '../graphql';
import {WithQuery} from '../WithQuery';
import {homeUrl} from '../urls';
import {UploadPicturesForm} from './UploadPicturesForm';
import {TransliterationInput} from './TransliterationInput';

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

  console.info(params.mainIdentifier);

  const mainIdentifier = decodeURIComponent(params.mainIdentifier);
  const manuscriptQuery = useManuscriptQuery({variables: {mainIdentifier}});

  function render({manuscript: m}: ManuscriptQuery): JSX.Element {
    if (!m) {
      return <Navigate to={homeUrl}/>;
    }

    return (
      <Routes>
        <Route path={'/data'} element={<ManuscriptData manuscript={m}/>}/>
        <Route path={uploadPicturesUrl} element={<UploadPicturesForm manuscript={m}/>}/>
        <Route path={createTransliterationUrl} element={<TransliterationInput manuscript={m}/>}/>
      </Routes>
    );
  }

  return <WithQuery query={manuscriptQuery} render={render}/>;
}