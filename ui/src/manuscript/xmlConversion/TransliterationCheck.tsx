import {JSX, useState} from 'react';
import {TransliterationTextArea} from '../TransliterationTextArea';
import {useTranslation} from 'react-i18next';
import {TLHParser} from 'simtex';
import {XmlNode} from 'simple_xml';

interface IProps {
  initialTransliteration: string;
  onConvert: (children: XmlNode[]) => void;
}

export function TransliterationCheck({initialTransliteration, onConvert}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [input, setInput] = useState(initialTransliteration);

  const onSubmit = (): void => onConvert(new TLHParser(input).exportXML().flat());

  return (
    <>
      <TransliterationTextArea input={input} onChange={setInput} disabled={false}/>

      <button type="button" onClick={onSubmit} disabled={false} className="my-2 p-2 rounded bg-blue-500 text-white w-full disabled:opacity-50">
        {t('convertToXml')}
      </button>
    </>
  );
}