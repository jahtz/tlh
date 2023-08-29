import {ReactElement, useState} from 'react';
import ReactCodeMirror from '@uiw/react-codemirror';
import {xml} from '@codemirror/lang-xml';
import {MyLeft, parseNewXml} from 'simple_xml';
import {tlhXmlEditorConfig} from '../../xmlEditor/tlhXmlEditorConfig';
import {useTranslation} from 'react-i18next';
import {blueButtonClasses} from '../../defaultDesign';
import {EditorView} from 'codemirror';

interface IProps {
  brokenXml: string;
  onUpdate: (value: string) => void;
}

export function XmlRepair({brokenXml, onUpdate}: IProps): ReactElement {

  const {t} = useTranslation('common');
  const [xmlContent, setXmlContent] = useState(brokenXml);

  const parseResult = parseNewXml(xmlContent, tlhXmlEditorConfig.readConfig);

  return (
    <>
      {parseResult instanceof MyLeft && <pre className="my-4 p-2 rounded bg-red-600 text-white">{parseResult.value}</pre>}

      <div className="my-4 p-2 border border-slate-500">
        <ReactCodeMirror extensions={[xml(), EditorView.lineWrapping]} value={brokenXml} onChange={setXmlContent}/>
      </div>

      <div className="text-center">
        <button type="button" className={blueButtonClasses} onClick={() => onUpdate(xmlContent)} disabled={parseResult instanceof MyLeft}>{t('update')}</button>
      </div>
    </>
  );
}