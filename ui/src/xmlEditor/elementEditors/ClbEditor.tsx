import {displayReplace, XmlEditableNodeIProps, XmlInsertableSingleEditableNodeConfig} from '../editorConfig';
import {useTranslation} from 'react-i18next';
import classNames from 'classnames';
import {selectedNodeClass} from '../tlhXmlEditorConfig';
import {XmlElementNode, xmlElementNode} from '../../xmlModel/xmlModel';

export const clbNodeConfig: XmlInsertableSingleEditableNodeConfig<XmlElementNode<'clb'>> = {
  replace: (node, _element, isSelected) => displayReplace(
    <span className={classNames(isSelected ? selectedNodeClass : 'bg-amber-500')}>{node.attributes.id}&nbsp;</span>
  ),
  edit: (props) => <ClbEditor {...props}/>,
  readNode: (node) => node as XmlElementNode<'clb'>,
  writeNode: (newNode) => newNode,
  insertablePositions: {
    beforeElement: ['w', 'parsep', 'parsep_dbl'],
    afterElement: ['w'],
    newElement: () => xmlElementNode('clb', {id: 'CLB'})
  }
};

export function ClbEditor({data, updateEditedNode, setKeyHandlingEnabled}: XmlEditableNodeIProps<XmlElementNode<'clb'>>): JSX.Element {

  const {t} = useTranslation('common');

  function updateId(value: string): void {
    updateEditedNode({attributes: {id: {$set: value}}});
  }

  return (
    <div className="mb-4">
      <label htmlFor="lineNumber" className="font-bold">{t('id')}:</label>
      <input type="text" id="lineNumber" className="p-2 rounded border border-slate-500 w-full mt-2"
             defaultValue={data.attributes.id?.trim()}
             onFocus={() => setKeyHandlingEnabled(false)} onChange={(event) => updateId(event.target.value)}/>
    </div>
  );
}
