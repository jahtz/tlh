import {XmlElementNode} from '../xmlModel/xmlModel';
import {Argument as ClassNamesArgument} from 'classnames';
import {InsertablePositions, NodePath} from '../insertablePositions';
import {Spec} from 'immutability-helper';

type ReplaceFunc = (node: XmlElementNode, renderedChildren: JSX.Element, isSelected: boolean) => JSX.Element;

type NodeStylingFunc = (node: XmlElementNode, isSelected: boolean) => ClassNamesArgument;

export type EditTriggerFunc = (node: XmlElementNode, path: NodePath) => void;


export interface XmlEditableNodeIProps<T = XmlElementNode> {
  data: T;
  changed: boolean;
  path: number[];
  updateNode: (spec: Spec<T>) => void;
  deleteNode: () => void;
  jumpEditableNodes: (tagName: string, forward: boolean) => void;
  setKeyHandlingEnabled: (enabled: boolean) => void;
  initiateJumpElement: (forward: boolean) => void;
  initiateSubmit: () => void;
}


export interface XmlSingleNodeConfig {
  replace?: ReplaceFunc;
  styling?: NodeStylingFunc;
  insertablePositions?: InsertablePositions;
}

export interface XmlSingleEditableNodeConfig<T = XmlElementNode> extends XmlSingleNodeConfig {
  edit: (props: XmlEditableNodeIProps<T>) => JSX.Element;
  readNode: (node: XmlElementNode) => T;
  writeNode: (t: T, originalNode: XmlElementNode) => XmlElementNode;
}

export interface XmlEditorConfig {
  [tagName: string]: XmlSingleNodeConfig | XmlSingleEditableNodeConfig;
}
