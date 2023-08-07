import {ReactElement} from 'react';
import {XmlEditableNodeIProps, XmlSingleInsertableEditableNodeConfig} from '../editorConfig';
import {useTranslation} from 'react-i18next';
import {selectedNodeClass} from '../tlhXmlEditorConfig';

export const wsepConfig: XmlSingleInsertableEditableNodeConfig<'wsep', 'c'> = {
  replace: (node, renderChildren, isSelected) => (
    <span className={isSelected ? selectedNodeClass : undefined}>{node.attributes.c}</span>
  ),
  edit: (props) => <WsepEditor {...props}/>,
  insertablePositions: {
    beforeElement: ['w'],
    afterElement: ['w']
  },
};

export function WsepEditor({node, updateAttribute}: XmlEditableNodeIProps<'wsep', 'c'>): ReactElement {

  const {t} = useTranslation('common');

  return (
    <>
      <label htmlFor="c" className="font-bold">{t('wsepType')}:</label>
      <input id="c" className="p-2 rounded border border-slate-500 bg-white w-full" defaultValue={node.attributes.c}
             onChange={(event) => updateAttribute('c', event.target.value)}></input>
    </>
  );
}