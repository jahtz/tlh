import {pictureBaseUrl} from '../urls';
import {ReactElement} from 'react';

interface IProps {
  mainIdentifier: string;
  pictures: string[];
  children?: (pictureName: string) => ReactElement;
}

export const PicturesBlock = ({mainIdentifier, pictures, children}: IProps): ReactElement => {
  return (
    <div className="grid grid-cols-4 gap-2">
      {pictures.map((pictureName) =>
        <div key={pictureName}>
          <figure className="image">
            <img src={`${pictureBaseUrl(mainIdentifier)}/${pictureName}`} alt={pictureName}/>
            <figcaption className="p-2 text-center">{pictureName}</figcaption>
          </figure>
          {children && children(pictureName)}
        </div>
      )}
    </div>
  );
};