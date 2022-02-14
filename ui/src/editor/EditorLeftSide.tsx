import {useState} from 'react';
import {NodeDisplay, NodeDisplayIProps} from './NodeDisplay';
import {useTranslation} from 'react-i18next';
import {EditTriggerFunc} from './editorConfig/editorConfig';
import {XmlSourceEditor} from './XmlSourceEditor';
import {writeXml} from './DocumentEditor';
import {XmlElementNode} from './xmlModel/xmlModel';
import classNames from 'classnames';

interface IProps extends NodeDisplayIProps {
  filename: string;
  onNodeSelect: EditTriggerFunc;
  closeFile: () => void;
  exportXml: () => void;
  updateNode: (node: XmlElementNode) => void;
}

const FONT_STEP = 10;

export function EditorLeftSide({
  filename,
  node,
  currentSelectedPath,
  editorConfig,
  onNodeSelect,
  closeFile,
  exportXml,
  insertStuff,
  updateNode
}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [fontSize, setFontSize] = useState(100);
  const [useSerifFont, setUseSerifFont] = useState(false);

  const [showSource, setShowSource] = useState(false);

  function onUpdateNode(node: XmlElementNode): void {
    setShowSource(false);
    updateNode(node);
  }

  return (
    <div className="flex flex-col h-full min-h-full max-h-full">
      <div className="py-4 rounded border border-slate-300 shadow-md text-center">{filename}<sup>&nbsp;</sup><sub>&nbsp;</sub></div>

      <div className="flex p-4 rounded border border-slate-300 shadow-md mb-4 flex-auto overflow-auto">
        {showSource
          ? <XmlSourceEditor source={writeXml(node as XmlElementNode)} updateNode={onUpdateNode}/>
          : <div className={classNames(useSerifFont ? 'font-hpm-serif' : 'font-hpm')} style={{fontSize: `${fontSize}%`}}>
            <NodeDisplay node={node} currentSelectedPath={currentSelectedPath} editorConfig={editorConfig} onSelect={onNodeSelect} insertStuff={insertStuff}/>
          </div>}
      </div>

      <div className="grid grid-cols-4">
        <button type="button" className="p-2 border border-slate-500 rounded-l" onClick={() => setFontSize((value) => value - FONT_STEP)}>
          -{FONT_STEP}%
        </button>
        <button className="p-2 border border-slate-500" disabled>{fontSize}%</button>
        <button type="button" className="p-2 border border-slate-500" onClick={() => setFontSize((value) => value + FONT_STEP)}>
          +{FONT_STEP}%
        </button>

        <button type="button" onClick={() => setUseSerifFont((use) => !use)} className="p-2 border border-slate-500 rounded-r">
          {useSerifFont ? t('useSerifLessFont') : t('useSerifFont')}
        </button>

      </div>

      <div className="grid grid-cols-3 mt-2">
        <button className="p-2 border border-slate-500 rounded-l" onClick={closeFile}>{t('closeFile')}</button>
        <button className="p-2 border border-slate-500" onClick={() => setShowSource((value) => !value)}>
          {showSource ? t('cancelEditSource') : t('editSource')}
        </button>
        <button type="button" className="p-2 border border-slate-500 bg-blue-600 text-white rounded-r" onClick={exportXml}>{t('exportXml')}</button>
      </div>
    </div>
  );
}