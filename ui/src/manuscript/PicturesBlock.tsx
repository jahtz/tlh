import {pictureBaseUrl} from '../urls';
import {JSX} from 'react';
import {useSelector} from 'react-redux';
import {activeUserSelector} from '../newStore';
import {useTranslation} from 'react-i18next';
import {blueButtonClasses, redButtonClasses} from '../defaultDesign';
import {Rights, useDeletePictureMutation} from '../graphql';

interface IProps {
  mainIdentifier: string;
  pictures: string[];
  onPictureDelete: () => void;
}


export function PicturesBlock({mainIdentifier, pictures, onPictureDelete}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const user = useSelector(activeUserSelector);
  const [deletePicture] = useDeletePictureMutation();

  const download = (pictureName: string) => {
    const element = document.createElement('a');
    element.href = URL.createObjectURL(
      new Blob([`${pictureBaseUrl(mainIdentifier)}/${pictureName}`], {type: 'image/*'})
    );
    element.download = pictureName;
    element.click();
  };

  const onDelete = async (pictureName: string): Promise<void> => {
    try {
      await deletePicture({variables: {mainIdentifier, pictureName}});

      onPictureDelete();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      {pictures.map((pictureName) =>
        <div key={pictureName}>
          <figure className="image">
            <img src={`${pictureBaseUrl(mainIdentifier)}/${pictureName}`} alt={pictureName}/>
            <figcaption className="p-2 text-center">{pictureName}</figcaption>
          </figure>
          <div className="text-center space-x-2">
            <button type="button" className={blueButtonClasses} onClick={() => download(pictureName)}>&#x1F847; {t('downloadImage')}</button>
            {user?.rights === Rights.ExecutiveEditor &&
              <button type="button" className={redButtonClasses} onClick={() => onDelete(pictureName)}>&#x2421; {t('deleteImage')}</button>}
          </div>
        </div>
      )}
    </div>
  );
}