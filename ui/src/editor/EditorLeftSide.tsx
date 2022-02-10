import {useState} from 'react';
import {NodeDisplay, NodeDisplayIProps} from './NodeDisplay';
import {useTranslation} from 'react-i18next';
import {EditTriggerFunc} from './editorConfig/editorConfig';
import {IoChevronDown, IoChevronUp} from 'react-icons/io5';
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
    <>
      <div className="box has-text-centered">{filename}<sup>&nbsp;</sup><sub>&nbsp;</sub></div>

      <div className="box ">
        {showSource
          ? <XmlSourceEditor source={writeXml(node as XmlElementNode)} updateNode={onUpdateNode}/>
          : <div className={classNames('scrollable', useSerifFont ? 'font-hpm-serif' : 'font-hpm')} style={{fontSize: `${fontSize}%`}}>
            <NodeDisplay node={node} currentSelectedPath={currentSelectedPath} editorConfig={editorConfig} onSelect={onNodeSelect} insertStuff={insertStuff}/>
          </div>}
      </div>

      <div className="field has-addons mt-2">
        <div className="control">
          <button type="button" className="button" onClick={() => setFontSize((value) => value - 10)}><IoChevronDown/></button>
        </div>
        <div className="control is-expanded">
          <input type="number" value={fontSize} step={10} onChange={(event) => setFontSize(() => parseInt(event.target.value))} className="input"/>
        </div>
        <div className="control">
          <button className="button is-static">%</button>
        </div>
        <div className="control is-expanded">
          <button type="button" onClick={() => setUseSerifFont((use) => !use)} className="button is-fullwidth">
            {useSerifFont ? t('useSerifLessFont') : t('useSerifFont')}
          </button>
        </div>
        <div className="control">
          <button type="button" className="button" onClick={() => setFontSize((value) => value + 10)}><IoChevronUp/></button>
        </div>
      </div>

      <div className="field has-addons">
        <div className="control is-expanded">
          <button className="button is-fullwidth" onClick={closeFile}>{t('closeFile')}</button>
        </div>
        <div className="control is-expanded">
          <button className="button is-fullwidth" onClick={() => setShowSource((value) => !value)}>
            {showSource ? t('cancelEditSource') : t('editSource')}
          </button>
        </div>
        <div className="control is-expanded">
          <button type="button" onClick={exportXml} className="button is-link is-fullwidth">{t('exportXml')}</button>
        </div>
      </div>
    </>
  );
}