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

          <button type="button" onClick={() => setUseSerifFont((use) => !use)} className="mr-2 px-2 border border-slate-500 rounded">
            {useSerifFont ? t('useSerifLessFont') : t('useSerifFont')}
          </button>

          <button type="button" className="mr-2 px-2 rounded bg-blue-500 text-white font-bold" onClick={() => setShowSource((value) => !value)}
                  title={t('editSource')}>
            {/* FIXME: change on state: {showSource ? t('cancelEditSource') : t('editSource')} */}
            &#x270E;
          </button>

          <button type="button" className="mr-2 px-2 rounded bg-green-400 text-white font-bold" onClick={exportXml}>&#x1F5AB;</button>

          <button type="button" className="px-2 rounded bg-red-600 text-white font-bold" onClick={closeFile}>&#10799;</button>
        </div>
      </div>

      <div className="flex p-4 rounded-b border border-slate-300 shadow-md flex-auto overflow-auto">
        {showSource
          ? <XmlSourceEditor source={writeXml(node as XmlElementNode)} updateNode={onUpdateNode}/>
          : <div className={classNames(useSerifFont ? 'font-hpm-serif' : 'font-hpm')} style={{fontSize: `${fontSize}%`}}>
            <NodeDisplay node={node} currentSelectedPath={currentSelectedPath} editorConfig={editorConfig} onSelect={onNodeSelect} insertStuff={insertStuff}/>
          </div>}
      </div>
    </div>
  );
}