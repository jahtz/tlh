import {pictureBaseUrl} from '../urls';
import {JSX} from 'react';

interface IProps {
  mainIdentifier: string;
  pictures: string[];
}

export function PicturesBlock({mainIdentifier, pictures}: IProps): JSX.Element {
  return (
    <div className="grid grid-cols-4 gap-2">
      {pictures.map((pictureName) =>
        <figure key={pictureName} className="image">
          <img src={`${pictureBaseUrl(mainIdentifier)}/${pictureName}`} alt={pictureName}/>
          <figcaption>{pictureName}</figcaption>
        </figure>
      )}
    </div>
  );
}