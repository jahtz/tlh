import {XmlElementNode} from '../../xmlModel/xmlModel';
import {displayReplace, XmlSingleEditableNodeConfig} from '../editorConfig';
import {NoteNodeEditor} from './NoteNodeEditor';

export interface NoteData {
  n: string;
  content: string;
}

export const noteNodeConfig: XmlSingleEditableNodeConfig<NoteData> = {
  replace: (node) => displayReplace(
    <sup title={node.attributes.c} className="has-text-weight-bold">x</sup>
  ),
  edit: (props) => <NoteNodeEditor {...props}/>,
  readNode: (node) => ({
    n: node.attributes.n || '',
    content: node.attributes.c || ''
  }),
  writeNode: ({n, content}: NoteData, originalNode: XmlElementNode): XmlElementNode => ({
    ...originalNode,
    attributes: {
      ...originalNode.attributes,
      n,
      c: content
    }
  })
};