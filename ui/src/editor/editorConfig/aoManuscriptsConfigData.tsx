import {XmlSingleEditableNodeConfig} from './editorConfig';
import {isXmlElementNode, XmlElementNode, XmlTextNode} from '../xmlModel/xmlModel';

import {AoManuscriptsEditor} from '../AoManuscriptsEditor';
import classNames from 'classnames';

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
  replace: (node, element, currentPath, currentSelectedPath) => {
    const isSelected = currentSelectedPath && currentPath.join('.') === currentSelectedPath.join('.');

    return <span className={classNames({'has-background-primary': isSelected})}>{element}</span>;
  },
  edit: (props) => <AoManuscriptsEditor {...props}/>,
  readNode: readAoManuscriptsNode,
  writeNode: writeAoManuscriptsNode
};

function readAoManuscriptsNode(node: XmlElementNode): AoManuscriptsData {
  return {
    content: node.children.map((n) => isXmlElementNode(n) ? readSource(n) : n.textContent.trim())
  };
}

function writeAoManuscriptsNode(data: AoManuscriptsData, originalNode: XmlElementNode): XmlElementNode {
  return {
    ...originalNode,
    children: data.content.map((s) => {
      if (typeof s === 'string') {
        return {textContent: ' ' + s + ' '};
      } else {
        return writeSource(s);
      }
    })
  };
}