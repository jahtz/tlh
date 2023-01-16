import {ChangeEvent, createRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {homeUrl} from '../urls';
import {PicturesBlock} from './PicturesBlock';
import {Navigate, useLoaderData} from 'react-router-dom';
import {ManuscriptMetaDataFragment} from '../graphql';

interface IState {
  selectedFile?: File;
  allPictures: string[];
}

type UploadResponse = { fileName: string; } | { error: string; };

export function UploadPicturesForm(): JSX.Element {

  const manuscript = useLoaderData() as ManuscriptMetaDataFragment | undefined;

  if (!manuscript) {
    return <Navigate to={homeUrl}/>;
  }

  const {t} = useTranslation('common');
  const [state, setState] = useState<IState>({allPictures: [...manuscript.pictureUrls]});
  const fileUploadRef = createRef<HTMLInputElement>();


  const uploadUrl = `${process.env.REACT_APP_SERVER_URL}/uploadPicture.php?id=${encodeURIComponent(manuscript.mainIdentifier.identifier)}`;

  function selectFile(event: ChangeEvent<HTMLInputElement>): void {
    const fileList = event.target.files;
    if (fileList && fileList.length > 0) {
      setState((currentState) => ({selectedFile: fileList[0], allPictures: currentState.allPictures}));
    }
  }

  function performUpload(): void {
    if (state.selectedFile) {
      const formData = new FormData();
      formData.append('file', state.selectedFile, state.selectedFile.name);

      fetch(uploadUrl, {body: formData, method: 'POST'})
        .then<UploadResponse>((response) => response.json())
        .then((response) =>
          'fileName' in response
            ? setState((currentState) => ({allPictures: currentState.allPictures.concat([response.fileName])}))
            : console.error(response.error)
        )
        .catch((error) => console.error(error));
    }
  }

  return (
    <div className="container mx-auto">
      <h1 className="font-bold text-2xl text-center mb-4">
        {t('manuscript{{mainIdentifier}}', {mainIdentifier: manuscript.mainIdentifier.identifier})}: {t('uploadPicture_plural')}
      </h1>

      <div className="my-3">
        {state.allPictures.length > 0
          ? <PicturesBlock mainIdentifier={manuscript.mainIdentifier.identifier} pictures={state.allPictures}/>
          : <div className="p-2 rounded bg-cyan-500 text-white text-center">{t('noPicturesUploadedYet')}.</div>}
      </div>

      <div className="flex">
        <input type="file" className="p-2 rounded-l border-l border-y border-slate-200 flex-grow" onChange={selectFile} ref={fileUploadRef}/>
        <button type="button" className="p-2 rounded-r border border-slate-200" disabled={!state.selectedFile} onClick={performUpload}>
          {t('uploadPicture')}
        </button>
      </div>
    </div>
  );
}
