import {XmlSingleEditableNodeConfig} from './editorConfig';
import {isXmlElementNode, XmlElementNode, XmlTextNode} from '../xmlModel/xmlModel';

import {AoManuscriptsEditor} from '../AoManuscriptsEditor';

export type SourceType = 'AO:TxtPubl' | 'AO:InvNr';

export const sourceTypes: SourceType[] = ['AO:TxtPubl', 'AO:InvNr'];

interface AoSource {
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
  sources: AoSource[];
}

export const aoManuscriptsConfig: XmlSingleEditableNodeConfig<AoManuscriptsData> = {
  edit: (props) => <AoManuscriptsEditor {...props}/>,
  readNode: readAoManuscriptsNode,
  writeNode: writeAoManuscriptsNode
};

function readAoManuscriptsNode(node: XmlElementNode): AoManuscriptsData {
  return {
    sources: node.children
      .filter((n): n is XmlElementNode => isXmlElementNode(n))
      .map(readSource)
  };
}

function writeAoManuscriptsNode(data: AoManuscriptsData, originalNode: XmlElementNode): XmlElementNode {
  return {
    ...originalNode,
    children: data.sources.map(writeSource)
  };
}