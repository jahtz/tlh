import {JSX, useState} from 'react';
import ReactCodeMirror from '@uiw/react-codemirror';
import {xml} from '@codemirror/lang-xml';
import {useTranslation} from 'react-i18next';

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
        <ReactCodeMirror value={xmlContent} extensions={[xml()]} onChange={setXmlContent}/>
      </div>

      <button type="button" onClick={() => onSubmit(xmlContent)} disabled={loading}
              className="my-2 p-2 rounded bg-blue-500 text-white w-full disabled:opacity-50">
        {t('submit')}
      </button>
    </>
  );
}