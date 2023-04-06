import {XmlElementNode, XmlReadConfig, XmlWriteConfig} from 'simple_xml';
import {Argument as ClassNamesArgument} from 'classnames';
import {InsertablePositions} from './insertablePositions';
import {Spec} from 'immutability-helper';

export const inputClasses = 'mt-2 p-2 rounded border border-slate-500 w-full';

export interface XmlEditableNodeIProps<T = void> {
  node: XmlElementNode;
  path: number[];
  updateEditedNode: (spec: Spec<XmlElementNode>) => void;
  updateAttribute: (key: string, value: string | undefined) => void;
  setKeyHandlingEnabled: (enabled: boolean) => void;
  additionalInfo: T;
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

export interface XmlSingleEditableNodeConfig<T = void> extends XmlSingleNodeConfig {
  edit: (props: XmlEditableNodeIProps<T>) => JSX.Element;
  getAdditionalInfo?: (rootNode: XmlElementNode, path: number[]) => T;
}

export function isXmlEditableNodeConfig(c: XmlEditorNodeConfig): c is XmlSingleEditableNodeConfig {
  return 'edit' in c;
}

export interface XmlInsertableSingleEditableNodeConfig<T = void> extends XmlSingleEditableNodeConfig<T> {
  insertablePositions: InsertablePositions;
}

export type XmlEditorNodeConfig = XmlSingleNodeConfig | XmlSingleEditableNodeConfig | XmlInsertableSingleEditableNodeConfig;

export interface XmlEditorConfig {
  readConfig: XmlReadConfig;
  writeConfig: XmlWriteConfig;
  nodeConfigs: {
    [tagName: string]: XmlEditorNodeConfig;
  };
  beforeExport: (node: XmlElementNode) => XmlElementNode;
  afterExport: (content: string) => string;
}
