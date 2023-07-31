import {JSX, useState} from 'react';
import ReactCodeMirror from '@uiw/react-codemirror';
import {xml} from '@codemirror/lang-xml';
import {useTranslation} from 'react-i18next';
import {mainButtonClasses} from '../../defaultDesign';

interface IProps {
  initialXml: string;
  loading: boolean;
  onSubmit: (value: string) => void;
}

export function XmlCheck({initialXml, loading, onSubmit}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [xmlContent, setXmlContent] = useState(initialXml);

  return (
    <>
      <div className="p-2 rounded border border-slate-500">
        <ReactCodeMirror extensions={[xml()]} value={xmlContent} onChange={setXmlContent}/>
      </div>

      <div className="text-center">
        <button type="button" className={mainButtonClasses} onClick={() => onSubmit(xmlContent)} disabled={loading}>
          {t('submit')}
        </button>
      </div>
    </>
  );
}