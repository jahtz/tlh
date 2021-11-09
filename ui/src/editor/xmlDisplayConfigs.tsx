import {GenericAttributes, XmlElementNode} from './xmlModel/xmlModel';
import {Argument as ClassNamesArgument} from 'classnames';
import {InsertablePositions, NodePath} from './insertablePositions';


type ReplaceFunc<A = GenericAttributes> = (node: XmlElementNode<A>, renderedChildren: JSX.Element, path: NodePath, currentSelectedPath?: NodePath) => JSX.Element;

type NodeStylingFunc<A = GenericAttributes> = (node: XmlElementNode<A>, path: NodePath, currentSelectedPath?: NodePath) => ClassNamesArgument;

type EditFunc<A = GenericAttributes> = (props: XmlEditableNodeIProps<A>) => JSX.Element;


export type EditTriggerFunc = (node: XmlElementNode, path: NodePath) => void;

export type UpdateNodeFunc<A = GenericAttributes> = (node: XmlElementNode<A>, path: NodePath) => void;


export interface XmlEditableNodeIProps<A = GenericAttributes> {
  node: XmlElementNode<A>;
  updateNode: UpdateNodeFunc<A>;
  deleteNode: () => void;
  path: NodePath;
  jumpEditableNodes: (tagName: string, forward: boolean) => void;
  setKeyHandlingEnabled: (enabled: boolean) => void;
  initiateJumpElement: (forward: boolean) => void;
}


export interface XmlSingleNodeConfig {
  replace?: ReplaceFunc;
  styling?: NodeStylingFunc<any>;
  // edit?: EditFunc<any>;
  insertablePositions?: InsertablePositions;
}

export interface XmlSingleEditableNodeConfig extends XmlSingleNodeConfig {
  edit: EditFunc<any>;
}

export interface XmlEditorConfig {
  [tagName: string]: XmlSingleNodeConfig | XmlSingleEditableNodeConfig;
}


