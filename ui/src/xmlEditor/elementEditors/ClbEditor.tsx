import {inputClasses, XmlEditableNodeIProps, XmlSingleInsertableEditableNodeConfig} from '../editorConfig';
import {JSX} from 'react';
import {useTranslation} from 'react-i18next';
import classNames from 'classnames';
import {selectedNodeClass} from '../tlhXmlEditorConfig';
import {xmlElementNode} from 'simple_xml';

type clbAttrs = 'id';

export const clbNodeConfig: XmlSingleInsertableEditableNodeConfig<'clb', clbAttrs> = {
  replace: ({node, isSelected}) => <span className={classNames(isSelected ? selectedNodeClass : 'bg-amber-500')}>{node.attributes.id}&nbsp;</span>,
  edit: (props) => <ClbEditor {...props}/>,
  insertablePositions: {
    beforeElement: ['w', 'parsep', 'parsep_dbl'],
    afterElement: ['w'],
    newElement: () => xmlElementNode('clb', {id: 'CLB'})
  }
};

function ClbEditor({node, updateAttribute, setKeyHandlingEnabled}: XmlEditableNodeIProps<'clb', clbAttrs>): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <>
      <label htmlFor="id" className="font-bold">{t('id')}:</label>
      <input type="text" id="id" className={inputClasses} defaultValue={node.attributes.id?.trim()} onFocus={() => setKeyHandlingEnabled(false)}
             onBlur={() => setKeyHandlingEnabled(true)} onChange={(event) => updateAttribute('id', event.target.value)}/>
    </>
  );
}