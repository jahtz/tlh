import {displayReplace, XmlSingleEditableNodeConfig} from '../editorConfig';
import {XmlElementNode, XmlTextNode} from 'simple_xml';
import {AoManuscriptsEditor} from './AoManuscriptsEditor';
import {selectedNodeClass} from '../tlhXmlEditorConfig';

export type SourceType = 'AO:TxtPubl' | 'AO:InvNr';
export const sourceTypes: SourceType[] = ['AO:TxtPubl', 'AO:InvNr'];

export interface AoSource {
  type: SourceType;
  name: string;
}

export function readSource(node: XmlElementNode): AoSource {
  if (node.tagName === 'AO:TxtPubl' || node.tagName === 'AO:InvNr') {
    return {type: node.tagName, name: (node.children[0] as XmlTextNode).textContent};
  } else {
    throw new Error(`Could not read Source with tagName ${node.tagName}`);
  }
}

export const aoManuscriptsConfig: XmlSingleEditableNodeConfig<XmlElementNode<'AO:Manuscripts'>> = {
  replace: (node, renderedChildren, isSelected) => displayReplace(
    <span className={isSelected ? selectedNodeClass : ''}>{renderedChildren}</span>
  ),
  edit: (props) => <AoManuscriptsEditor {...props}/>,
  readNode: (node) => node as XmlElementNode<'AO:Manuscripts'>,
  writeNode: (data) => data
};
