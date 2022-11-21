import {XmlElementNode} from '../xmlModel/xmlModel';
import {Argument as ClassNamesArgument} from 'classnames';
import {InsertablePositions, NodePath} from './insertablePositions';
import {Spec} from 'immutability-helper';
import {FontSizeSelectorProps} from './FontSizeSelector';
import {NodeEditorRightSideProps} from './NodeEditorRightSide';

export type EditTriggerFunc = (node: XmlElementNode, path: NodePath) => void;

export interface XmlEditableNodeIProps<T = XmlElementNode> extends NodeEditorRightSideProps {
  data: T;
  path: number[];
  updateNode: (spec: Spec<T>) => void;
  keyHandlingEnabled: boolean,
  setKeyHandlingEnabled: (enabled: boolean) => void;
  initiateJumpElement: (forward: boolean) => void;
  fontSizeSelectorProps: FontSizeSelectorProps;
}


export interface DisplayReplacement {
  clickable: JSX.Element;
  notClickable?: JSX.Element;
}

export function displayReplace(clickable: JSX.Element, notClickable?: JSX.Element): DisplayReplacement {
  return {clickable, notClickable};
}

export interface XmlSingleNodeConfig {
  replace?: (node: XmlElementNode, renderedChildren: JSX.Element, isSelected: boolean, isLeftSide: boolean) => DisplayReplacement;
  styling?: (node: XmlElementNode, isSelected: boolean, isLeftSide: boolean) => ClassNamesArgument;
  dontRenderChildrenInline?: boolean;
}

export interface XmlSingleEditableNodeConfig<T = XmlElementNode> extends XmlSingleNodeConfig {
  edit: (props: XmlEditableNodeIProps<T>) => JSX.Element;
  readNode: (node: XmlElementNode) => T;
  writeNode: (t: T, originalNode: XmlElementNode) => XmlElementNode;
}

export function isXmlEditableNodeConfig<T>(c: XmlEditorNodeConfig): c is XmlSingleEditableNodeConfig<T> {
  return 'edit' in c;
}

export interface XmlInsertableSingleEditableNodeConfig<T = XmlElementNode> extends XmlSingleEditableNodeConfig<T> {
  insertablePositions: InsertablePositions;
}

export type XmlEditorNodeConfig = XmlSingleNodeConfig | XmlSingleEditableNodeConfig | XmlInsertableSingleEditableNodeConfig;

export interface XmlEditorConfig {
  nodeConfigs: {
    [tagName: string]: XmlEditorNodeConfig;
  };
  beforeExport: (node: XmlElementNode) => XmlElementNode;
  afterExport: (content: string) => string;
}
