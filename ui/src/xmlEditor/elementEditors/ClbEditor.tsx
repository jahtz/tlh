import {displayReplace, inputClasses, XmlEditableNodeIProps, XmlInsertableSingleEditableNodeConfig} from '../editorConfig';
import {JSX} from 'react';
import {useTranslation} from 'react-i18next';
import classNames from 'classnames';
import {selectedNodeClass} from '../tlhXmlEditorConfig';
import {xmlElementNode} from 'simple_xml';

export const clbNodeConfig: XmlInsertableSingleEditableNodeConfig = {
  replace: (node, _element, isSelected) => displayReplace(
    <span className={classNames(isSelected ? selectedNodeClass : 'bg-amber-500')}>{node.attributes.id}&nbsp;</span>
  ),
  edit: (props) => <ClbEditor {...props}/>,
  insertablePositions: {
    beforeElement: ['w', 'parsep', 'parsep_dbl'],
    afterElement: ['w'],
    newElement: () => xmlElementNode('clb', {id: 'CLB'})
  }
};

function ClbEditor({node, updateAttribute, setKeyHandlingEnabled}: XmlEditableNodeIProps): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <>
      <label htmlFor="id" className="font-bold">{t('id')}:</label>
      <input type="text" id="id" className={inputClasses} defaultValue={node.attributes.id?.trim()} onFocus={() => setKeyHandlingEnabled(false)}
             onChange={(event) => updateAttribute('id', event.target.value)}/>
    </>
  );
}