import {inputClasses, XmlEditableNodeIProps, XmlInsertableSingleEditableNodeConfig} from '../editorConfig';
import {JSX} from 'react';
import {useTranslation} from 'react-i18next';
import {getElementByPath, XmlElementNode} from 'simple_xml';
import {buildActionSpec} from '../XmlDocumentEditor';
import {displayReplace} from '../editorConfig/displayReplacement';

export const clEditorConfig: XmlInsertableSingleEditableNodeConfig = {
  replace: (node, renderChildren) => displayReplace(
    <><br/><span className="px-1 cl">{node.attributes.id || ' '}</span>&nbsp;</>,
    renderChildren()
  ),
  dontRenderChildrenInline: true,
  edit: (props) => <ClEditor {...props}/>,
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

function ClEditor({node, updateAttribute, setKeyHandlingEnabled}: XmlEditableNodeIProps): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <>
      <label htmlFor="id" className="font-bold block">{t('id')}:</label>
      <input type="text" id="id" className={inputClasses} defaultValue={node.attributes.id} onFocus={() => setKeyHandlingEnabled(false)}
             onChange={(event) => updateAttribute('id', event.target.value)}/>
    </>
  );
}