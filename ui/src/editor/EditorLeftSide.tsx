import {useState} from 'react';
import {NodeDisplay, NodeDisplayIProps} from './NodeDisplay';
import {useTranslation} from 'react-i18next';
import {EditTriggerFunc} from './editorConfig/editorConfig';
import {XmlElementNode} from './xmlModel/xmlModel';
import classNames from 'classnames';
import {parseNewXml} from './xmlModel/xmlReading';
import {xml} from '@codemirror/lang-xml';
import ReactCodeMirror from '@uiw/react-codemirror';
import {writeXml} from './DocumentEditor';

export interface EditorLeftSideProps extends NodeDisplayIProps {
  filename: string;
  onNodeSelect: EditTriggerFunc;
  closeFile: () => void;
  exportXml: () => void;
  updateNode: (node: XmlElementNode) => void;
  setKeyHandlingEnabled: (value: boolean) => void;
}

const FONT_STEP = 10;

export function EditorLeftSide({
  filename,
  node,
  currentSelectedPath,
  onNodeSelect,
  closeFile,
  exportXml,
  insertStuff,
  updateNode,
  setKeyHandlingEnabled
}: EditorLeftSideProps): JSX.Element {

  const {t} = useTranslation('common');
  const [fontSize, setFontSize] = useState(100);
  const [useSerifFont, setUseSerifFont] = useState(false);

  const [xmlSource, setXmlSource] = useState<string | undefined>();

  function activateShowSource(): void {
    setKeyHandlingEnabled(false);
    setXmlSource(writeXml(node as XmlElementNode));
  }

  function deactivateShowSource(): void {
    setKeyHandlingEnabled(true);
    setXmlSource(undefined);
  }

  function onXmlSourceUpdate(): void {
    updateNode(parseNewXml(xmlSource as string) as XmlElementNode);
    deactivateShowSource();
  }

  return (
    <div className="flex flex-col h-full min-h-full max-h-full">
      <div className="p-4 rounded-t border border-slate-300 shadow-md">
        <span className="font-bold">{filename}</span>

        <div className="float-right">

          <button type="button" className="px-2 border border-slate-500 rounded-l" onClick={() => setFontSize((value) => value - FONT_STEP)}>
            -{FONT_STEP}%
          </button>
          <button className="px-2 border border-slate-500" disabled>{fontSize}%</button>
          <button type="button" className="mr-2 px-2 border border-slate-500 rounded-r" onClick={() => setFontSize((value) => value + FONT_STEP)}>
            +{FONT_STEP}%
          </button>

          {xmlSource
            ? <>
              <button className="mr-2 px-2 rounded bg-red-500 text-white font-bold" onClick={deactivateShowSource} title={t('cancelEditXmlSource')}>
                &#x270E;
              </button>
              <button className="mr-2 px-2 rounded bg-blue-500 text-white font-bold" onClick={onXmlSourceUpdate} title={t('applyXmlSourceChange')}>
                &#x270E;
              </button>
            </>
            : <>
              <button onClick={() => setUseSerifFont((use) => !use)} className="mr-2 px-2 border border-slate-500 rounded">
                {useSerifFont ? t('useSerifLessFont') : t('useSerifFont')}
              </button>
              <button className="mr-2 px-2 rounded bg-blue-500 text-white font-bold" onClick={activateShowSource} title={t('editSource')}>
                &#x270E;
              </button>
            </>}

          <button className="mr-2 px-2 rounded bg-green-400 text-white font-bold" onClick={exportXml} title={t('exportXml')}>&#x1F5AB;</button>

          <button className="px-2 rounded bg-red-600 text-white font-bold" onClick={closeFile} title={t('closeFile')}>&#10799;</button>
        </div>
      </div>

      <div className="flex p-4 rounded-b border border-slate-300 shadow-md flex-auto overflow-auto">
        {xmlSource
          ? <ReactCodeMirror value={xmlSource} extensions={[xml()]} onChange={setXmlSource}/>
          : <div className={classNames(useSerifFont ? 'font-hpm-serif' : 'font-hpm')} style={{fontSize: `${fontSize}%`}}>
            <NodeDisplay node={node} currentSelectedPath={currentSelectedPath} onSelect={onNodeSelect} insertStuff={insertStuff}/>
          </div>}
      </div>
    </div>
  );
}