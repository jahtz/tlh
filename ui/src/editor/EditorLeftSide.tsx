import { useState } from 'react';
import {BulmaCard} from '../bulmaHelpers/BulmaCard';
import classNames from 'classnames';
import {NodeDisplay, NodeDisplayIProps} from './NodeDisplay';
import {useTranslation} from 'react-i18next';
import {EditTriggerFunc} from './xmlDisplayConfigs';

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
  const [useSerifFont, setUseSerifFont] = useState(false);

  return (
    <>
      <BulmaCard title={filename}>
        <div className={classNames('scrollable', useSerifFont ? 'font-hpm-serif' : 'font-hpm')}>
          <NodeDisplay node={node} currentSelectedPath={currentSelectedPath} editorConfig={editorConfig} onSelect={onNodeSelect}
                       insertStuff={insertStuff}/>
        </div>
      </BulmaCard>

      <div className="columns my-3">
        <div className="column">
          <button type="button" onClick={() => setUseSerifFont((use) => !use)} className="button is-fullwidth">
            {useSerifFont ? t('useSerifLessFont') : t('useSerifFont')}
          </button>
        </div>
        <div className="column">
          <button className="button is-fullwidth" onClick={closeFile}>{t('closeFile')}</button>
        </div>
        <div className="column">
          <button type="button" onClick={exportXml} className="button is-link is-fullwidth">{t('exportXml')}</button>
        </div>
      </div>
    </>
  );
}