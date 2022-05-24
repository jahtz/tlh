import {XmlEditableNodeIProps, XmlInsertableSingleEditableNodeConfig} from '../editorConfig/editorConfig';
import {useTranslation} from 'react-i18next';
import {NodeEditorRightSide} from '../NodeEditorRightSide';

export const clEditorConfig: XmlInsertableSingleEditableNodeConfig = {
  replace: (node, renderedChildren, isSelected, isLeftSide) => (
    <div>
      <span className="px-1 cl">{node.attributes.id || ' '}</span>&nbsp;{isLeftSide && renderedChildren}
    </div>
  ),
  edit: (props) => <ClEditor {...props} />,
  readNode: (n) => n,
  writeNode: (n) => n,
  insertablePositions: {
    beforeElement: ['cl', 'w'],
    afterElement: ['cl', 'w'],
  }
};

export function ClEditor({
  data,
  originalNode,
  changed,
  updateNode,
  deleteNode,
  setKeyHandlingEnabled,
  initiateSubmit,
  initiateJumpElement,
  fontSizeSelectorProps,
  cancelSelection,
}: XmlEditableNodeIProps): JSX.Element {
  const {t} = useTranslation('common');

  return (
    <NodeEditorRightSide
      originalNode={originalNode}
      changed={changed}
      initiateSubmit={initiateSubmit}
      jumpElement={initiateJumpElement}
      deleteNode={deleteNode}
      fontSizeSelectorProps={fontSizeSelectorProps}
      cancelSelection={cancelSelection}
    >
      <div>
        <label htmlFor="id" className="font-bold block">{t('id')}:</label>
        <input id="id" defaultValue={originalNode.attributes.id}
               className="p-2 rounded border border-slate-200 w-full mt-2"
               onFocus={() => setKeyHandlingEnabled(false)}
               onChange={(event) => updateNode({attributes: {id: {$set: event.target.value}}})}/>
      </div>

    </NodeEditorRightSide>
  );
}
