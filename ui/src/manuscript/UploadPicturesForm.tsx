import {ChangeEvent, createRef, ReactElement, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {homeUrl, pictureBaseUrl} from '../urls';
import {PicturesBlock} from './PicturesBlock';
import {Link, Navigate, useParams} from 'react-router-dom';
import {ManuscriptIdentWithCreatorFragment, Rights, useDeletePictureMutation, useUploadPicturesQuery} from '../graphql';
import {WithQuery} from '../WithQuery';
import {blueButtonClasses, redButtonClasses} from '../defaultDesign';
import {User} from '../newStore';
import update from 'immutability-helper';
import {makeDownload} from '../downloadHelper';

interface IState {
  selectedFile?: File;
  allPictures: string[];
}

type UploadResponse = { fileName: string; } | { error: string; };

interface IProps {
  currentUser: User;
  manuscript: ManuscriptIdentWithCreatorFragment;
}

function Inner({currentUser, manuscript}: IProps): ReactElement {

  const {t} = useTranslation('common');
  const [{selectedFile, allPictures}, setState] = useState<IState>({allPictures: [...manuscript.pictureUrls]});
  const fileUploadRef = createRef<HTMLInputElement>();
  const [deletePicture] = useDeletePictureMutation();

  const mainIdentifier = manuscript.mainIdentifier.identifier;

  const download = (pictureName: string) => makeDownload(`${pictureBaseUrl(mainIdentifier)}/${pictureName}`, pictureName, 'image/*');

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
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile, selectedFile.name);

      const response = await fetch(uploadUrl, {body: formData, method: 'POST'});
      const result: UploadResponse = await response.json();

      'fileName' in result
        ? setState((currentState) => ({selectedFile: undefined, allPictures: currentState.allPictures.concat([result.fileName])}))
        : console.error(result.error);
    }
  }

  const onDelete = async (pictureName: string): Promise<void> => {
    try {
      const {data} = await deletePicture({variables: {mainIdentifier, pictureName}});

      if (data?.manuscript?.deletePicture) {
        // FIXME: delete image from list?
        setState((state) => update(state, {allPictures: (pictures) => pictures.filter(picName => picName !== pictureName)}));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const canDeleteImages = currentUser.sub === manuscript.creatorUsername || currentUser.rights === Rights.ExecutiveEditor;

  return (
    <div className="container mx-auto">
      <h1 className="font-bold text-2xl text-center mb-4">{t('manuscript')} {mainIdentifier}: {t('uploadPicture_plural')}</h1>

      <div className="my-4">
        {allPictures.length === 0
          ? <div className="my-4 p-2 rounded bg-cyan-500 text-white text-center">{t('noPicturesUploadedYet')}.</div>
          : <PicturesBlock mainIdentifier={mainIdentifier} pictures={allPictures}>
            {(pictureName) => (
              <div className="text-center space-x-2">
                <button type="button" className={blueButtonClasses} onClick={() => download(pictureName)}>&#x1F847; {t('downloadImage')}</button>
                {canDeleteImages &&
                  <button type="button" className={redButtonClasses} onClick={() => onDelete(pictureName)}>&#x2421; {t('deleteImage')}</button>}
              </div>
            )}
          </PicturesBlock>}
      </div>

      <div className="my-4 p-2 rounded border border-slate-500">
        <div className="my-4 flex">
          <input type="file" className="p-2 rounded-l border-l border-y border-slate-200 flex-grow" defaultValue={selectedFile?.name} onChange={selectFile}
                 ref={fileUploadRef}/>
          <button type="button" className="px-4 py-2 rounded-r bg-blue-500 text-white" disabled={!selectedFile} onClick={performUpload}>
            {t('uploadPicture')}
          </button>
        </div>

        {selectedFile && <img className="w-1/2 mx-auto" src={URL.createObjectURL(selectedFile)} alt={selectedFile.name}/>}
      </div>

      <div className="my-4 text-center">
        <Link to={'../data'} className={blueButtonClasses}>{t('backToManuscript')}</Link>
      </div>
    </div>
  );

}


export function UploadPicturesForm({currentUser}: { currentUser: User }): ReactElement {

  const {mainIdentifier} = useParams<'mainIdentifier'>();

  if (mainIdentifier === undefined) {
    return <Navigate to={homeUrl}/>;
  }

  const query = useUploadPicturesQuery({variables: {mainIdentifier}});

  return (
    <WithQuery query={query}>
      {({manuscript}) => manuscript
        ? <Inner manuscript={manuscript} currentUser={currentUser}/>
        : <Navigate to={homeUrl}/>}
    </WithQuery>
  );
}
