import {XmlElementNode} from '../xmlModel/xmlModel';
import {XmlSingleEditableNodeConfig} from './editorConfig';
import {NoteNodeEditor} from './NoteNodeEditor';

export interface NoteData {
  n: string;
  content: string;
}

function readNoteNodeData(node: XmlElementNode): NoteData {
  return {
    n: node.attributes.n,
    content: node.attributes.c
  };
}

function writeNoteNodeData({n, content}: NoteData, originalNode: XmlElementNode): XmlElementNode {
  return {
    ...originalNode,
    attributes: {
      ...originalNode.attributes,
      n,
      c: content
    }
  };
}


export const noteNodeConfig: XmlSingleEditableNodeConfig<NoteData> = {
  replace: (node) => <sup title={node.attributes.c} className="has-text-weight-bold">x</sup>,
  edit: (props) => <NoteNodeEditor {...props}/>,
  readNode: readNoteNodeData,
  writeNode: writeNoteNodeData/*,
  insertablePositions: {
    asLastChildOf: ['w']
  }*/
};