import {JSX, useState} from 'react';
import {TransliterationTextArea} from '../TransliterationTextArea';
import {useTranslation} from 'react-i18next';
import {XmlCreationValues} from './createCompleteDocument';
import {blueButtonClasses} from '../../defaultDesign';

interface IProps {
  xmlCreationValues: XmlCreationValues;
  initialTransliteration: string;
  onConvert: (input: string) => void;
}

export function TransliterationCheck({xmlCreationValues, initialTransliteration, onConvert}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [input, setInput] = useState(initialTransliteration);

  return (
    <>
      <TransliterationTextArea initialInput={input} xmlCreationValues={xmlCreationValues} onChange={setInput} disabled={false}/>

      <div className="text-center">
        <button type="button" onClick={() => onConvert(input)} className={blueButtonClasses}>{t('convertToXml')}</button>
      </div>
    </>
  );
}