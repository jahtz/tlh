import React, {ChangeEvent} from "react";
import {useTranslation} from "react-i18next";

interface IProps {
  accept?: string;
  onLoad: (f: File) => void;
}

export function FileLoader({accept, onLoad}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  function handleFile(event: ChangeEvent<HTMLInputElement>): void {
    if (event.target.files && event.target.files.length > 0) {
      onLoad(event.target.files[0]);
    }

  }

  return (
    <div className="file">
      <label className="file-label">
        <input className="file-input" type="file" onChange={(event) => handleFile(event)}
               accept={accept}/>
        <div className="file-cta">
          <div className="file-icon"><i className="fas fa-upload"/></div>
          <div className="file-label">{t('chooseFile')}</div>
        </div>
      </label>
    </div>
  );
}