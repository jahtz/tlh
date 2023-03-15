import {displayReplace, XmlEditableNodeIProps, XmlInsertableSingleEditableNodeConfig} from '../editorConfig';
import {useTranslation} from 'react-i18next';
import classNames from 'classnames';
import {selectedNodeClass} from '../tlhXmlEditorConfig';
import {XmlElementNode, xmlElementNode} from 'simple_xml';

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

function ClbEditor({data, updateEditedNode, setKeyHandlingEnabled}: XmlEditableNodeIProps<XmlElementNode<'clb'>>): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <>
      <label htmlFor="id" className="font-bold">{t('id')}:</label>
      <input type="text" id="id" className="mt-2 p-2 rounded border border-slate-500 w-full"
             defaultValue={data.attributes.id?.trim()}
             onFocus={() => setKeyHandlingEnabled(false)}
             onChange={(event) => updateEditedNode({attributes: {id: {$set: event.target.value}}})}/>
    </>
  );
}
