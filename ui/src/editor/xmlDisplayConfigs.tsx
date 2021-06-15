import {XmlElementNode} from './xmlModel';

interface XmlNodeReplacement {
  __type: 'XmlNodeReplacement';
  f: (n: XmlElementNode) => JSX.Element;
}

export function nodeReplacement(f: (n: XmlElementNode) => JSX.Element): XmlNodeReplacement {
  return {__type: 'XmlNodeReplacement', f};
}


interface XmlNodeStyling {
  __type: 'XmlNodeStyling';
  f: (n: XmlElementNode) => string[];
}

export function nodeStyling(f: (n: XmlElementNode) => string[]): XmlNodeStyling {
  return {__type: 'XmlNodeStyling', f};
}


export type EditTriggerFunc = (editedNode: XmlElementNode, renderedChildren: JSX.Element, editConfig: XmlEditableNode, path: number[]) => void;

export type UpdateNode = (node: XmlElementNode, path: number[]) => void;

export interface XmlEditableNodeIProps {
  node: XmlElementNode;
  renderedChildren: JSX.Element;
  updateNode: UpdateNode;
  path: number[];
}

export interface XmlEditableNode {
  __type: 'XmlEditableNode';
  styling?: (n: XmlElementNode) => string[];
  edit: (props: XmlEditableNodeIProps) => JSX.Element;
}

export function xmlEditableNode(
  edit: (props: XmlEditableNodeIProps) => JSX.Element,
  styling?: (n: XmlElementNode) => string[]
): XmlEditableNode {
  return {__type: 'XmlEditableNode', edit, styling};
}


export interface XmlNodeDisplayConfig {
  [nodeTagName: string]: XmlNodeReplacement | XmlNodeStyling | XmlEditableNode;
}


