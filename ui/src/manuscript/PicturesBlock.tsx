import {pictureBaseUrl} from '../urls';

interface IProps {
  mainIdentifier: string;
  pictures: string[];
}

export function PicturesBlock({mainIdentifier, pictures}: IProps): JSX.Element {
  return (
    <div className="columns">
      {pictures.map((pictureName) =>
        <div key={pictureName} className="column is-2">
          <div className="card">
            <div className="card-image">
              <figure className="image">
                <img src={`${pictureBaseUrl(mainIdentifier)}/${pictureName}`} alt={pictureName}/>
              </figure>
            </div>
            <div className="card-content">{pictureName}</div>
          </div>
        </div>
      )}
    </div>
  );
}