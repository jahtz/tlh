import {XmlElementNode, XmlNode, XmlReadConfig, XmlWriteConfig} from 'simple_xml';
import {JSX, ReactElement} from 'react';
import {Argument as ClassNamesArgument} from 'classnames';
import {InsertablePositions} from './insertablePositions';
import {Spec} from 'immutability-helper';
import {DisplayReplacement} from './editorConfig/displayReplacement';

export const inputClasses = 'mt-2 p-2 rounded border border-slate-500 w-full';

export interface XmlEditableNodeIProps<T extends string = string, A extends string = string> {
  node: XmlElementNode<T, A>;
  path: number[];
  updateEditedNode: (spec: Spec<XmlElementNode<T, A>>) => void;
  updateAttribute: (key: A, value: string | undefined) => void;
  setKeyHandlingEnabled: (enabled: boolean) => void;
  rootNode: XmlElementNode;
  updateOtherNode: (path: number[], spec: Spec<XmlNode>) => void;
}

export interface XmlSingleNodeConfig<T extends string = string, A extends string = string> {
  replace?: (node: XmlElementNode<T, A>, renderChildren: () => JSX.Element, isSelected: boolean, isLeftSide: boolean) => ReactElement | DisplayReplacement;
  styling?: (node: XmlElementNode<T, A>, isSelected: boolean, isLeftSide: boolean) => ClassNamesArgument;
  dontRenderChildrenInline?: boolean;
}

export interface XmlSingleEditableNodeConfig<T extends string = string, A extends string = string> extends XmlSingleNodeConfig<T, A> {
  edit: (props: XmlEditableNodeIProps<T>) => JSX.Element;
}

export function isXmlEditableNodeConfig<T extends string = string, A extends string = string>(c: XmlEditorSingleNodeConfig<T, A>): c is XmlSingleEditableNodeConfig<T, A> {
  return 'edit' in c;
}

export interface XmlSingleInsertableEditableNodeConfig<T extends string = string, A extends string = string> extends XmlSingleEditableNodeConfig<T, A> {
  insertablePositions: InsertablePositions;
}

export function isXmlSingleInsertableEditableNodeConfig<T extends string = string, A extends string = string>(c: XmlEditorSingleNodeConfig<T>): c is XmlSingleInsertableEditableNodeConfig<T, A> {
  return 'insertablePositions' in c;
}

export type XmlEditorSingleNodeConfig<T extends string = string, A extends string = string> =
  XmlSingleNodeConfig<T, A>
  | XmlSingleEditableNodeConfig<T, A>
  | XmlSingleInsertableEditableNodeConfig<T, A>;

export interface XmlEditorConfig {
  readConfig: XmlReadConfig;
  writeConfig: XmlWriteConfig;
  nodeConfigs: {
    [tagName: string]: XmlEditorSingleNodeConfig;
  };
  beforeExport: (node: XmlElementNode) => XmlElementNode;
  afterExport: (content: string) => string;
}
