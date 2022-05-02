import {XmlEditableNodeIProps} from '../editorConfig/editorConfig';
import {useTranslation} from 'react-i18next';
import {LineBreakData} from './lineBreakData';
import {LanguageInput} from '../LanguageInput';
import {NodeEditorRightSide} from '../NodeEditorRightSide';

export function LineBreakEditor({
  data,
  originalNode,
  changed,
  updateNode,
  deleteNode,
  setKeyHandlingEnabled,
  initiateSubmit,
  initiateJumpElement,
  fontSizeSelectorProps
}: XmlEditableNodeIProps<LineBreakData>): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <NodeEditorRightSide originalNode={originalNode} changed={changed} initiateSubmit={initiateSubmit} jumpElement={initiateJumpElement}
                         deleteNode={deleteNode} fontSizeSelectorProps={fontSizeSelectorProps}>
      <div>
        <div className="mb-4">
          <label htmlFor="textId" className="font-bold">{t('textId')}:</label>
          <input type="text" id="textId" className="p-2 rounded border border-slate-500 w-full mt-2" defaultValue={data.textId} readOnly/>
        </div>

        <div className="mb-4">
          <label htmlFor="lineNumber" className="font-bold">{t('lineNumber')}:</label>
          <input type="text" id="lineNumber" className="p-2 rounded border border-slate-500 w-full mt-2" defaultValue={data.lineNumber?.trim()}
                 onFocus={() => setKeyHandlingEnabled(false)} onBlur={(event) => updateNode({lineNumber: {$set: event.target.value}})}/>
        </div>

        <div className="mb-4">
          <LanguageInput initialValue={data.lg} onBlur={(value) => updateNode({lg: {$set: value}})}/>
        </div>
      </div>
    </NodeEditorRightSide>
  );
}