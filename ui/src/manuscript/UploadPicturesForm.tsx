import {ChangeEvent, createRef, ReactElement, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {homeUrl} from '../urls';
import {PicturesBlock} from './PicturesBlock';
import {Link, Navigate, useParams} from 'react-router-dom';
import {ManuscriptIdentWithCreatorFragment, useUploadPicturesQuery} from '../graphql';
import {WithQuery} from '../WithQuery';
import {blueButtonClasses} from '../defaultDesign';

interface IState {
  selectedFile?: File;
  allPictures: string[];
}

type UploadResponse = { fileName: string; } | { error: string; };

interface IProps {
  manuscript: ManuscriptIdentWithCreatorFragment;
}

function Inner({manuscript}: IProps): ReactElement {

  const {t} = useTranslation('common');
  const [state, setState] = useState<IState>({allPictures: [...manuscript.pictureUrls]});
  const fileUploadRef = createRef<HTMLInputElement>();

  const mainIdentifier = manuscript.mainIdentifier.identifier;

  // FIXME: url needs version...
  const uploadUrl = process.env.NODE_ENV === 'development'
    ? `${process.env.REACT_APP_SERVER_URL}/uploadPicture.php?id=${encodeURIComponent(mainIdentifier)}`
    : `/${process.env.REACT_APP_VERSION}/uploadPicture.php?id=${encodeURIComponent(mainIdentifier)}`;

  function selectFile(event: ChangeEvent<HTMLInputElement>): void {
    const fileList = event.target.files;
    if (fileList !== null && fileList.length > 0) {
      setState((currentState) => ({selectedFile: fileList[0], allPictures: currentState.allPictures}));
    }
  }

  async function performUpload(): Promise<void> {
    if (state.selectedFile) {
      const formData = new FormData();
      formData.append('file', state.selectedFile, state.selectedFile.name);

      const response = await fetch(uploadUrl, {body: formData, method: 'POST'});
      const result: UploadResponse = await response.json();

      'fileName' in result
        ? setState((currentState) => ({allPictures: currentState.allPictures.concat([result.fileName])}))
        : console.error(result.error);
    }
  }

  return (
    <div className="container mx-auto">
      <h1 className="font-bold text-2xl text-center mb-4">
        {t('manuscript')} {mainIdentifier}: {t('uploadPicture_plural')}
      </h1>

      <div className="my-4">
        {state.allPictures.length > 0
          ? <PicturesBlock mainIdentifier={mainIdentifier} pictures={state.allPictures}/>
          : <div className="p-2 rounded bg-cyan-500 text-white text-center">{t('noPicturesUploadedYet')}.</div>}
      </div>

      <div className="my-4 flex">
        <input type="file" className="p-2 rounded-l border-l border-y border-slate-200 flex-grow" onChange={selectFile} ref={fileUploadRef}/>
        <button type="button" className="p-2 rounded-r border border-slate-200" disabled={!state.selectedFile} onClick={performUpload}>
          {t('uploadPicture')}
        </button>
      </div>

      <div className="my-4 text-center">
        <Link to={'../data'} className={blueButtonClasses}>{t('backToManuscript')}</Link>
      </div>
    </div>
  );

}

export function UploadPicturesForm(): ReactElement {

  const {mainIdentifier} = useParams<'mainIdentifier'>();

  if (mainIdentifier === undefined) {
    return <Navigate to={homeUrl}/>;
  }

  const query = useUploadPicturesQuery({variables: {mainIdentifier}});

  return (
    <WithQuery query={query}>
      {({manuscript}) => manuscript
        ? <Inner manuscript={manuscript}/>
        : <Navigate to={homeUrl}/>}
    </WithQuery>
  );
}
