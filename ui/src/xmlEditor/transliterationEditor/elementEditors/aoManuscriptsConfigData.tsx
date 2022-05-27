import {XmlSingleEditableNodeConfig} from '../editorConfig/editorConfig';
import {isXmlElementNode, XmlElementNode, XmlTextNode} from '../xmlModel/xmlModel';
import {AoManuscriptsEditor} from './AoManuscriptsEditor';
import update from 'immutability-helper';
import {selectedNodeClass} from '../editorConfig/tlhTransliterationEditorConfig';

export type SourceType = 'AO:TxtPubl' | 'AO:InvNr';
export const sourceTypes: SourceType[] = ['AO:TxtPubl', 'AO:InvNr'];

export interface AoSource {
  type: SourceType;
  name: string;
}

function readSource(node: XmlElementNode): AoSource {
  if (node.tagName === 'AO:TxtPubl' || node.tagName === 'AO:InvNr') {
    return {type: node.tagName, name: (node.children[0] as XmlTextNode).textContent};
  } else {
    throw new Error(`Could not read Source with tagName ${node.tagName}`);
  }
}

function writeSource({type, name}: AoSource): XmlElementNode {
  return {
    tagName: type,
    attributes: {},
    children: [{textContent: name}]
  };
}

export interface AoManuscriptsData {
  content: (string | AoSource)[];
}

export const aoManuscriptsConfig: XmlSingleEditableNodeConfig<AoManuscriptsData> = {
  replace: (node, renderedChildren, isSelected) => <span className={isSelected ? selectedNodeClass : ''}>{renderedChildren}</span>,
  edit: (props) => <AoManuscriptsEditor {...props}/>,
  readNode: (node) => ({content: node.children.map((n) => isXmlElementNode(n) ? readSource(n) : n.textContent.trim())}),
  writeNode: (data, originalNode) => update(originalNode, {
    children: {
      $set: data.content.map((s) => typeof s === 'string' ? {textContent: ' ' + s + ' '} : writeSource(s))
    }
  })
};
