import {displayReplace, XmlEditableNodeIProps, XmlInsertableSingleEditableNodeConfig} from '../editorConfig';
import {useTranslation} from 'react-i18next';
import {NodeEditorRightSide} from '../NodeEditorRightSide';
import {buildActionSpec, getElementByPath, XmlElementNode} from '../../xmlModel/xmlModel';

export const clEditorConfig: XmlInsertableSingleEditableNodeConfig = {
  replace: (node, renderedChildren, isSelected, isLeftSide) => displayReplace(
    <>
      <span className="px-1 cl">{node.attributes.id || ' '}</span>&nbsp;
    </>,
    isLeftSide ? <>{renderedChildren}<br/></> : undefined
  ),
  edit: (props) => <ClEditor {...props} />,
  readNode: (n) => n,
  writeNode: (n) => n,
  dontRenderChildrenInline: true,
  insertablePositions: {
    beforeElement: ['cl', 'w'],
    afterElement: ['cl', 'w'],
    insertAction: (path, newNode, rootNode) => {
      const parentNode: XmlElementNode = getElementByPath(rootNode, path.slice(0, -1));

      if (parentNode.tagName !== 'cl') {
        return buildActionSpec({children: {$splice: [[path[path.length - 1], 0, newNode]]}}, path.slice(0, -1));
      }

      // inside <cl/> node, split!
      const clIndex = path[path.length - 2];
      const splitIndex = path[path.length - 1];

      const firstNewNode = {...parentNode, children: parentNode.children.slice(0, splitIndex)};
      const secondNewNode = {...parentNode, children: parentNode.children.slice(splitIndex)};

      return buildActionSpec({children: {$splice: [[clIndex, 1, firstNewNode, secondNewNode]]}}, path.slice(0, -2));
    }
  }
};

export function ClEditor({
  /*  data,*/
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
