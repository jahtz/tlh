import {JSX, useState} from 'react';
import {TransliterationTextArea} from '../TransliterationTextArea';
import {useTranslation} from 'react-i18next';
import {TLHParser} from 'simtex';
import {writeNode, xmlElementNode} from 'simple_xml';
import {tlhXmlEditorConfig} from '../../xmlEditor/tlhXmlEditorConfig';

interface IProps {
  initialTransliteration: string;
  onConvert: (value: string) => void;
}

export function TransliterationCheck({initialTransliteration, onConvert}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [input, setInput] = useState(initialTransliteration);

  const onSubmit = (): void => onConvert(
    writeNode(
      xmlElementNode('text', {}, new TLHParser(input).exportXML().flat()),
      tlhXmlEditorConfig.writeConfig
    ).join('\n')
  );

  return (
    <>
      <TransliterationTextArea input={input} onChange={setInput}/>

      <button type="button" onClick={onSubmit} disabled={false} className="my-2 p-2 rounded bg-blue-500 text-white w-full disabled:opacity-50">
        {t('convertToXml')}
      </button>
    </>
  );
}