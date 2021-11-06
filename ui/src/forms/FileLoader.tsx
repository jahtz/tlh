import {ChangeEvent, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import classNames from 'classnames';

interface IProps {
  accept?: string;
  onLoad: (f: File) => Promise<void>;
  text?: string;
}

export function FileLoader({accept, onLoad, text}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [loading, setIsLoading] = useState(false);

  function handleFile(event: ChangeEvent<HTMLInputElement>): void {
    if (event.target.files && event.target.files.length === 1) {
      setIsLoading(true);

      onLoad(event.target.files[0])
        .then(() => setIsLoading(false));
    }
  }

  return (
    <>
      <button type="button" className={classNames('button', 'is-fullwidth', {'is-loading': loading})}
              onClick={() => fileInput.current && fileInput.current.click()} disabled={loading}>
        {text || t('chooseFile')}
      </button>

      <input type="file" onChange={handleFile} accept={accept} ref={fileInput} hidden/>
    </>
  );
}