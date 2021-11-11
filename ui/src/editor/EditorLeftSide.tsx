import {useState} from 'react';
import classNames from 'classnames';
import {NodeDisplay, NodeDisplayIProps} from './NodeDisplay';
import {useTranslation} from 'react-i18next';
import {EditTriggerFunc} from './editorConfig/editorConfig';
import {IoChevronDown, IoChevronUp} from 'react-icons/io5';

interface IProps extends NodeDisplayIProps {
  filename: string;
  onNodeSelect: EditTriggerFunc;
  closeFile: () => void;
  exportXml: () => void;
}

export function EditorLeftSide({
  filename,
  node,
  currentSelectedPath,
  editorConfig,
  onNodeSelect,
  closeFile,
  exportXml,
  insertStuff
}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [fontSize, setFontSize] = useState(1);
  const [useSerifFont, setUseSerifFont] = useState(false);

  return (
    <>
      <div className="box has-text-centered">{filename}<sup>&nbsp;</sup><sub>&nbsp;</sub></div>

      <div className={classNames('box', 'scrollable', useSerifFont ? 'font-hpm-serif' : 'font-hpm')} style={{fontSize: `${fontSize}em`}}>
        <NodeDisplay node={node} currentSelectedPath={currentSelectedPath} editorConfig={editorConfig} onSelect={onNodeSelect} insertStuff={insertStuff}/>
      </div>

      <div className="field has-addons mt-2">
        <div className="control">
          <button type="button" className="button" onClick={() => setFontSize((value) => Math.round(value * 10 - 1) / 10)}><IoChevronDown/></button>
        </div>
        <div className="control is-expanded">
          <input type="number" value={fontSize} step={0.1} onChange={(event) => setFontSize(() => parseFloat(event.target.value))} className="input"/>
        </div>
        <div className="control is-expanded">
          <button type="button" onClick={() => setUseSerifFont((use) => !use)} className="button is-fullwidth">
            {useSerifFont ? t('useSerifLessFont') : t('useSerifFont')}
          </button>
        </div>
        <div className="control">
          <button type="button" className="button" onClick={() => setFontSize((value) => Math.round(value * 10 + 1) / 10)}><IoChevronUp/></button>
        </div>
      </div>

      <div className="field has-addons">
        <div className="control is-expanded">
          <button className="button is-fullwidth" onClick={closeFile}>{t('closeFile')}</button>
        </div>
        <div className="control is-expanded">
          <button type="button" onClick={exportXml} className="button is-link is-fullwidth">{t('exportXml')}</button>
        </div>
      </div>
    </>
  );
}