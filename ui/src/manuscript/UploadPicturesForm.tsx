import { ChangeEvent, createRef, useState } from 'react';
import {useTranslation} from 'react-i18next';
import {serverUrl} from '../urls';
import {ManuscriptBaseIProps} from './ManuscriptBase';
import {PicturesBlock} from './PicturesBlock';

interface IState {
  selectedFile: File | null;
  allPictures: string[];
}

interface FileUploadSuccess {
  fileName: string;
}

interface FileUploadFailure {
  error: string;
}

type UploadResponse = FileUploadSuccess | FileUploadFailure;

export function UploadPicturesForm({manuscript}: ManuscriptBaseIProps): JSX.Element {

  const {t} = useTranslation('common');

  const uploadUrl = `${serverUrl}/uploadPicture.php?id=${manuscript.mainIdentifier.identifier}`;

  const [state, setState] = useState<IState>({
    selectedFile: null,
    allPictures: [...manuscript.pictureUrls]
  });

  const fileUploadRef = createRef<HTMLInputElement>();

  function selectFile(event: ChangeEvent<HTMLInputElement>): void {
    const fileList = event.target.files;
    if (fileList && fileList.length > 0) {
      setState((currentState) => {
        return {selectedFile: fileList[0], allPictures: currentState.allPictures};
      });
    }
  }

  function performUpload(): void {
    if (state.selectedFile) {
      const file = state.selectedFile;

      const formData = new FormData();
      formData.append('file', file, file.name);

      fetch(uploadUrl, {body: formData, method: 'POST'})
        .then<UploadResponse>((response) => response.json())
        .then((response) => {
          if ('fileName' in response) {
            setState((currentState) => {
              return {
                selectedFile: null,
                allPictures: currentState.allPictures.concat([response.fileName])
              };
            });
          } else {
            console.error(response.error);
          }
        })
        .catch((error) => console.error(error));
    }
  }

  return <div className="container">
    <h1 className="title is-3 has-text-centered">
      {t('manuscript{{mainIdentifier}}', {mainIdentifier: manuscript.mainIdentifier.identifier})}: {t('uploadPicture_plural')}
    </h1>

    <div className="my-3">
      {manuscript.pictureUrls.length > 0
        ? <PicturesBlock mainIdentifier={manuscript.mainIdentifier.identifier} pictures={state.allPictures}/>
        : <div className="notification is-info has-text-centered">{t('noPicturesUploadedYet')}.</div>
      }
    </div>

    <div className="field has-addons">
      <div className="control is-expanded">
        <input type="file" className="input" onChange={selectFile} ref={fileUploadRef}/>
      </div>
      <div className="control">
        <button className="button is-link" disabled={!state.selectedFile} onClick={performUpload}>{t('uploadPicture')}</button>
      </div>
    </div>

  </div>;
}
