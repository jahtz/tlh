import {displayReplace, XmlEditableNodeIProps, XmlInsertableSingleEditableNodeConfig} from '../editorConfig';
import {selectedNodeClass} from '../tlhXmlEditorConfig';
import {XmlElementNode} from 'simple_xml';

export const paragraphSeparatorConfig: XmlInsertableSingleEditableNodeConfig<XmlElementNode<'parsep' | 'parsep_dbl'>> = {
  replace: (node, _renderedChildren, isSelected) => displayReplace(
    <span className={isSelected ? selectedNodeClass : ''}>
      {node.tagName === 'parsep' ? '¬¬¬' : '==='}
    </span>
  ),
  edit: (props) => <ParagraphSeparatorEditor {...props}/>,
  readNode: (node) => node as XmlElementNode<'parsep' | 'parsep_dbl'>,
  writeNode: (node) => node,
  insertablePositions: {
    beforeElement: ['w'],
    afterElement: ['lb', 'w'],
    asLastChildOf: ['div1']
  }
};

const separatorTypes: ('parsep' | 'parsep_dbl')[] = ['parsep', 'parsep_dbl'];

function ParagraphSeparatorEditor({data, updateEditedNode}: XmlEditableNodeIProps<XmlElementNode<'parsep' | 'parsep_dbl'>>): JSX.Element {

  return (
    <select className="p-2 rounded border border-slate-500 bg-white w-full" defaultValue={data.tagName}
            onChange={(event) => updateEditedNode({tagName: {$set: event.target.value as 'parsep' | 'parsep_dbl'}})}>
      {separatorTypes.map((st) => <option key={st}>{st}</option>)}
    </select>
  );
}