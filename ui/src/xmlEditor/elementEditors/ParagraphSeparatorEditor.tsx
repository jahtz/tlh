import {displayReplace, XmlEditableNodeIProps, XmlInsertableSingleEditableNodeConfig} from '../editorConfig';
import {selectedNodeClass} from '../tlhXmlEditorConfig';

export const paragraphSeparatorConfig: XmlInsertableSingleEditableNodeConfig = {
  replace: (node, _renderedChildren, isSelected) => displayReplace(
    <span className={isSelected ? selectedNodeClass : ''}>
      {node.tagName === 'parsep' ? '¬¬¬' : '==='}
    </span>
  ),
  edit: (props) => <ParagraphSeparatorEditor {...props}/>,
  insertablePositions: {
    beforeElement: ['w'],
    afterElement: ['lb', 'w'],
    asLastChildOf: ['div1']
  }
};

const separatorTypes: ('parsep' | 'parsep_dbl')[] = ['parsep', 'parsep_dbl'];

function ParagraphSeparatorEditor({node, updateEditedNode}: XmlEditableNodeIProps): JSX.Element {
  return (
    <select className="p-2 rounded border border-slate-500 bg-white w-full" defaultValue={node.tagName}
            onChange={(event) => updateEditedNode({tagName: {$set: event.target.value as 'parsep' | 'parsep_dbl'}})}>
      {separatorTypes.map((st) => <option key={st}>{st}</option>)}
    </select>
  );
}