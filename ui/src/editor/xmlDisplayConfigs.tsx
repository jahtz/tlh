import {XmlElementNode} from './xmlModel';
import {Argument as ClassNamesArgument} from 'classnames';

type ReplaceFunc = (node: XmlElementNode, renderedChildren: JSX.Element) => JSX.Element;

export type NodeStylingFunc = (node: XmlElementNode, path: number[], currentSelectedPath?: number[]) => ClassNamesArgument;

type EditFunc = (props: XmlEditableNodeIProps) => JSX.Element;


export type EditTriggerFunc = (node: XmlElementNode, path: number[]) => void;

export type UpdateNodeFunc = (node: XmlElementNode, path: number[]) => void;


export interface XmlEditableNodeIProps {
  node: XmlElementNode;
  updateNode: UpdateNodeFunc;
  path: number[];
  jumpEditableNodes: (tagName: string, forward: boolean) => void;
}


export interface XmlSingleNodeConfig {
  replace?: ReplaceFunc;
  styling?: NodeStylingFunc;
  edit?: EditFunc;
}


export interface XmlNodeDisplayConfigObject {
  [tagName: string]: XmlSingleNodeConfig;
}


