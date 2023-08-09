import {ReactElement} from 'react';
import {XmlEditableNodeIProps, XmlSingleInsertableEditableNodeConfig} from '../editorConfig';
import {useTranslation} from 'react-i18next';
import {selectedNodeClass} from '../tlhXmlEditorConfig';
import {xmlElementNode} from 'simple_xml';
import classNames from 'classnames';

export const wsepConfig: XmlSingleInsertableEditableNodeConfig<'wsep', 'c'> = {
  replace: ({node, isSelected}) => (
    <span className={classNames('font-hpm', {[selectedNodeClass]: isSelected})}>{node.attributes.c}</span>
  ),
  edit: (props) => <WsepEditor {...props}/>,
  insertablePositions: {
    beforeElement: ['w'],
    afterElement: ['w'],
    newElement: () => xmlElementNode('wsep', {c: '𒑱'})
  },
};

const legalValues = ['𒑱', '𒀹', '|'];

export function WsepEditor({node, updateAttribute}: XmlEditableNodeIProps<'wsep', 'c'>): ReactElement {

  const {t} = useTranslation('common');

  return (
    <>
      <label htmlFor="c" className="font-bold">{t('wsepType')}:</label>
      <select id="c" className="p-2 rounded border border-slate-500 bg-white w-full font-hpm" defaultValue={node.attributes.c}
              onChange={(event) => updateAttribute('c', event.target.value)}>
        {legalValues.map((value) => <option key={value} className="font-hpm">{value}</option>)}
      </select>
    </>
  );
}