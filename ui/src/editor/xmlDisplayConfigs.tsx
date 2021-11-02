import {GenericAttributes, XmlElementNode} from './xmlModel/xmlModel';
import {Argument as ClassNamesArgument} from 'classnames';

type ReplaceFunc<A = GenericAttributes> = (node: XmlElementNode<A>, renderedChildren: JSX.Element, path: number[], currentSelectedPath?: number[]) => JSX.Element;

type NodeStylingFunc<A = GenericAttributes> = (node: XmlElementNode<A>, path: number[], currentSelectedPath?: number[]) => ClassNamesArgument;

type EditFunc<A = GenericAttributes> = (props: XmlEditableNodeIProps<A>) => JSX.Element;


export type EditTriggerFunc = (node: XmlElementNode, path: number[]) => void;

export type UpdateNodeFunc<A = GenericAttributes> = (node: XmlElementNode<A>, path: number[]) => void;


export interface XmlEditableNodeIProps<A = GenericAttributes> {
  node: XmlElementNode<A>;
  updateNode: UpdateNodeFunc<A>;
  deleteNode: () => void;
  path: number[];
  jumpEditableNodes: (tagName: string, forward: boolean) => void;
  keyHandlingEnabled: boolean;
  setKeyHandlingEnabled: (enabled: boolean) => void;
  initiateJumpElement: (forward: boolean) => void;
}


interface InsertablePositions {
  asFirstChildOf?: string[];
  beforeElement?: string[];
  afterElement?: string[];
  asLastChildOf?: string[];
}

interface XmlSingleNodeConfig {
  replace?: ReplaceFunc;
  styling?: NodeStylingFunc<any>;
  edit?: EditFunc<any>;
  insertablePositions?: InsertablePositions;
}


export interface XmlNodeDisplayConfigObject {
  [tagName: string]: XmlSingleNodeConfig;
}


