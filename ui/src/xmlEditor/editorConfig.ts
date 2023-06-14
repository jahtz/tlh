import {XmlElementNode, XmlReadConfig, XmlWriteConfig} from 'simple_xml';
import {JSX, ReactElement} from 'react';
import {Argument as ClassNamesArgument} from 'classnames';
import {InsertablePositions} from './insertablePositions';
import {Spec} from 'immutability-helper';
import {DisplayReplacement} from './editorConfig/displayReplacement';

export const inputClasses = 'mt-2 p-2 rounded border border-slate-500 w-full';

export interface XmlEditableNodeIProps {
  node: XmlElementNode;
  path: number[];
  updateEditedNode: (spec: Spec<XmlElementNode>) => void;
  updateAttribute: (key: string, value: string | undefined) => void;
  setKeyHandlingEnabled: (enabled: boolean) => void;
  rootNode: XmlElementNode;
}

export interface XmlSingleNodeConfig {
  replace?: (node: XmlElementNode, renderChildren: () => JSX.Element, isSelected: boolean, isLeftSide: boolean) => ReactElement | DisplayReplacement;
  styling?: (node: XmlElementNode, isSelected: boolean, isLeftSide: boolean) => ClassNamesArgument;
  dontRenderChildrenInline?: boolean;
}

export interface XmlSingleEditableNodeConfig<Props extends XmlEditableNodeIProps = XmlEditableNodeIProps> extends XmlSingleNodeConfig {
  edit: (props: Props) => JSX.Element;
}

export function isXmlEditableNodeConfig(c: XmlEditorNodeConfig): c is XmlSingleEditableNodeConfig {
  return 'edit' in c;
}

export interface XmlSingleInsertableEditableNodeConfig extends XmlSingleEditableNodeConfig {
  insertablePositions: InsertablePositions;
}

export type XmlEditorNodeConfig = XmlSingleNodeConfig | XmlSingleEditableNodeConfig | XmlSingleInsertableEditableNodeConfig;

export interface XmlEditorConfig {
  readConfig: XmlReadConfig;
  writeConfig: XmlWriteConfig;
  nodeConfigs: {
    [tagName: string]: XmlEditorNodeConfig;
  };
  beforeExport: (node: XmlElementNode) => XmlElementNode;
  afterExport: (content: string) => string;
}
