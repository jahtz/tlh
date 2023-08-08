import {pictureBaseUrl} from '../urls';
import {JSX} from 'react';

interface IProps {
  mainIdentifier: string;
  pictures: string[];
}

const download = (mainIdentifier: string, pictureName: string) => {
  const element = document.createElement('a');
  element.href = URL.createObjectURL(
    new Blob([`${pictureBaseUrl(mainIdentifier)}/${pictureName}`], {type: 'image/*'})
  );
  element.download = pictureName;
  element.click();
};

export function PicturesBlock({mainIdentifier, pictures}: IProps): JSX.Element {

  return (
    <div className="grid grid-cols-4 gap-2">
      {pictures.map((pictureName) =>
        <figure key={pictureName} className="image">
          <img src={`${pictureBaseUrl(mainIdentifier)}/${pictureName}`} alt={pictureName}/>
          <button className="my-2 p-2 rounded bg-blue-500 text-white text-center w-full" onClick={() => download(mainIdentifier, pictureName)}>
            &#x1F847; {pictureName}
          </button>
        </figure>
      )}
    </div>
  );
}