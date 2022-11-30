import {displayReplace, XmlEditableNodeIProps, XmlSingleEditableNodeConfig} from '../editorConfig';
import {selectedNodeClass} from '../tlhXmlEditorConfig';
import {XmlElementNode} from '../../xmlModel/xmlModel';
import {NodeEditorRightSide} from '../NodeEditorRightSide';

export const paragraphSeparatorConfig: XmlSingleEditableNodeConfig<XmlElementNode<'parsep' | 'parsep_dbl'>> = {
  replace: (node, _renderedChildren, isSelected) => displayReplace(
    <span className={isSelected ? selectedNodeClass : ''}>
      {node.tagName === 'parsep' ? '¬¬¬' : '==='}
    </span>
  ),
  edit: (props) => <ParagraphSeparatorEditor {...props}/>,
  readNode: (node) => node as XmlElementNode<'parsep' | 'parsep_dbl'>,
  writeNode: (node) => node,
};

const separatorTypes: ('parsep' | 'parsep_dbl')[] = ['parsep', 'parsep_dbl'];

function ParagraphSeparatorEditor({data, updateNode, rightSideProps}: XmlEditableNodeIProps<XmlElementNode<'parsep' | 'parsep_dbl'>>): JSX.Element {

  return (
    <NodeEditorRightSide {...rightSideProps}>
      <select className="p-2 rounded border border-slate-500 bg-white w-full" defaultValue={data.tagName}
              onChange={(event) => updateNode({tagName: {$set: event.target.value as 'parsep' | 'parsep_dbl'}})}>
        {separatorTypes.map((st) => <option key={st}>{st}</option>)}
      </select>
    </NodeEditorRightSide>
  );
}