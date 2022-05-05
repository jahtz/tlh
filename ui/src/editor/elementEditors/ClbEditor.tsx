import {XmlEditableNodeIProps} from '../editorConfig/editorConfig';
import {useTranslation} from 'react-i18next';
import {NodeEditorRightSide} from '../NodeEditorRightSide';
import {ClbData} from './clbData';

export function ClbEditor({
  data,
  originalNode,
  changed,
  updateNode,
  deleteNode,
  setKeyHandlingEnabled,
  initiateSubmit,
  initiateJumpElement,
  fontSizeSelectorProps
}: XmlEditableNodeIProps<ClbData>): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <NodeEditorRightSide originalNode={originalNode} changed={changed} initiateSubmit={initiateSubmit} jumpElement={initiateJumpElement}
                         deleteNode={deleteNode} fontSizeSelectorProps={fontSizeSelectorProps}>

      <div className="mb-4">
        <label htmlFor="lineNumber" className="font-bold">{t('id')}:</label>
        <input type="text" id="lineNumber" className="p-2 rounded border border-slate-500 w-full mt-2" defaultValue={data.id.trim()}
               onFocus={() => setKeyHandlingEnabled(false)} onChange={(event) => updateNode({id: {$set: event.target.value}})}/>
      </div>

    </NodeEditorRightSide>
  );
}