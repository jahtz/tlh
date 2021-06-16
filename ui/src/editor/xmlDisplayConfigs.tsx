import {XmlElementNode} from './xmlModel';
import {Argument as ClassNamesArgument} from 'classnames';

interface XmlNodeReplacement {
  __type: 'XmlNodeReplacement';
  f: (n: XmlElementNode) => JSX.Element;
}

export function nodeReplacement(f: (n: XmlElementNode) => JSX.Element): XmlNodeReplacement {
  return {__type: 'XmlNodeReplacement', f};
}


interface XmlNodeStyling {
  __type: 'XmlNodeStyling';
  f: NodeStylingFunc;
}

export function nodeStyling(f: (n: XmlElementNode) => string[]): XmlNodeStyling {
  return {__type: 'XmlNodeStyling', f};
}

export type NodeStylingFunc = (node: XmlElementNode, path: number[], currentSelectedPath?: number[]) => ClassNamesArgument;

export type EditTriggerFunc = (node: XmlElementNode, path: number[]) => void;

export type UpdateNode = (node: XmlElementNode, path: number[]) => void;

export interface XmlEditableNodeIProps {
  node: XmlElementNode;
  updateNode: UpdateNode;
  path: number[];
  jumpEditableNodes: (tagName: string, forward: boolean) => void;
}

export interface XmlEditableNode {
  __type: 'XmlEditableNode';
  styling?: NodeStylingFunc;
  edit: (props: XmlEditableNodeIProps) => JSX.Element;
}

export function xmlEditableNode(
  edit: (props: XmlEditableNodeIProps) => JSX.Element,
  styling?: NodeStylingFunc
): XmlEditableNode {
  return {__type: 'XmlEditableNode', edit, styling};
}


export interface XmlNodeDisplayConfig {
  [tagName: string]: XmlNodeReplacement | XmlNodeStyling | XmlEditableNode;
}


