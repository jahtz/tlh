import {displayReplace, XmlEditableNodeIProps, XmlInsertableSingleEditableNodeConfig} from '../editorConfig';
import {useTranslation} from 'react-i18next';
import {getElementByPath, XmlElementNode} from 'simple_xml';
import {buildActionSpec} from '../XmlDocumentEditor';

export const clEditorConfig: XmlInsertableSingleEditableNodeConfig<XmlElementNode<'cl'>> = {
  replace: (node, renderedChildren, isSelected, isLeftSide) => displayReplace(
    <><span className="px-1 cl">{node.attributes.id || ' '}</span>&nbsp;</>,
    isLeftSide ? <>{renderedChildren}<br/></> : undefined
  ),
  edit: (props) => <ClEditor {...props} />,
  readNode: (n) => n as XmlElementNode<'cl'>,
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

function ClEditor({data, updateEditedNode, setKeyHandlingEnabled}: XmlEditableNodeIProps<XmlElementNode<'cl'>>): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <>
      <label htmlFor="id" className="font-bold block">{t('id')}:</label>
      <input id="id" className="mt-2 p-2 rounded border border-slate-200 w-full"
             defaultValue={data.attributes.id}
             onFocus={() => setKeyHandlingEnabled(false)}
             onChange={(event) => updateEditedNode({attributes: {id: {$set: event.target.value}}})}/>
    </>
  );
}
