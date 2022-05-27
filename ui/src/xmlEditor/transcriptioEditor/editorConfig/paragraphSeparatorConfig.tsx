import {XmlEditableNodeIProps, XmlSingleEditableNodeConfig} from './editorConfig';
import classNames from 'classnames';
import {useTranslation} from 'react-i18next';
import {selectedNodeClass} from './tlhTranscriptioXmlEditorConfig';

export const paragraphSeparatorConfig: XmlSingleEditableNodeConfig = {
  replace: (node, _renderedChildren, isSelected) => (
    <span className={isSelected ? selectedNodeClass : ''}>
      {node.tagName === 'parsep' ? '¬¬¬' : '==='}
    </span>
  ),
  edit: (props) => <ParagraphSeparatorEditor {...props}/>,
  readNode: (node) => node,
  writeNode: (node) => node,
};

const separatorTypes: string[] = ['parsep', 'parsep_dbl'];

function ParagraphSeparatorEditor({data, updateNode, changed, initiateSubmit, deleteNode}: XmlEditableNodeIProps): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <div>
      <select className="p-2 rounded border border-slate-500 bg-white w-full" defaultValue={data.tagName}
              onChange={(event) => updateNode({tagName: {$set: event.target.value}})}>
        {separatorTypes.map((st) => <option key={st}>{st}</option>)}
      </select>

      <div className="grid grid-cols-2 mt-2">
        <button type="button" className="p-2 rounded-l bg-red-500 text-white" onClick={deleteNode}>{t('deleteNode')}</button>
        <button type="button" className={classNames('p-2', 'rounded-r', changed ? ['bg-blue-500', 'text-white'] : ['border', 'border-slate-500'])}
                disabled={!changed} onClick={initiateSubmit}>
          {t('update')}
        </button>
      </div>
    </div>
  );
}