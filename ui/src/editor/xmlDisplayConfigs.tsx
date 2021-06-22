import {GenericAttributes, XmlElementNode} from './xmlModel';
import {Argument as ClassNamesArgument} from 'classnames';

type ReplaceFunc = (node: XmlElementNode, renderedChildren: JSX.Element) => JSX.Element;

export type NodeStylingFunc<A = GenericAttributes> = (node: XmlElementNode<A>, path: number[], currentSelectedPath?: number[]) => ClassNamesArgument;

type EditFunc<A = GenericAttributes> = (props: XmlEditableNodeIProps<A>) => JSX.Element;


export type EditTriggerFunc = (node: XmlElementNode, path: number[]) => void;

export type UpdateNodeFunc<A = GenericAttributes> = (node: XmlElementNode<A>, path: number[]) => void;


export interface XmlEditableNodeIProps<A = GenericAttributes> {
  node: XmlElementNode<A>;
  updateNode: UpdateNodeFunc<A>;
  path: number[];
  jumpEditableNodes: (tagName: string, forward: boolean) => void;
}


export interface XmlSingleNodeConfig {
  replace?: ReplaceFunc;
  styling?: NodeStylingFunc<any>;
  edit?: EditFunc<any>;
}


export interface XmlNodeDisplayConfigObject {
  [tagName: string]: XmlSingleNodeConfig;
}


