import {ReactElement} from 'react';
import {XmlEditableNodeIProps, XmlSingleInsertableEditableNodeConfig} from '../editorConfig';
import {useTranslation} from 'react-i18next';
import {selectedNodeClass} from '../tlhXmlEditorConfig';

type wsepAttrs = 'c';

const allWsepTypes: { [key: string]: string } = {
  ';': '𒀹',
  ':': '𒑱',
  '|': '|'
};

export const wsepConfig: XmlSingleInsertableEditableNodeConfig<'wsep', wsepAttrs> = {
  replace: (node, renderChildren, isSelected) => {

    const content = allWsepTypes[node.attributes.c || '|'] || node.attributes.c;

    return <span className={isSelected ? selectedNodeClass : undefined}>{content}</span>;
  },
  edit: (props) => <WsepEditor {...props}/>,
  insertablePositions: {
    beforeElement: ['w'],
    afterElement: ['w']
  },
};

export function WsepEditor({node, updateAttribute}: XmlEditableNodeIProps<'wsep', wsepAttrs>): ReactElement {

  const {t} = useTranslation('common');

  return (
    <>
      <label htmlFor="c" className="font-bold">{t('wsepType')}:</label>
      <select id="c" className="p-2 rounded border border-slate-500 bg-white w-full" defaultValue={node.attributes.c}
              onChange={(event) => updateAttribute('c', event.target.value)}>
        {Object.entries(allWsepTypes).map(([wsepType, display]) => <option key={wsepType} value={wsepType}>{display}</option>)}
      </select>
    </>
  );
}