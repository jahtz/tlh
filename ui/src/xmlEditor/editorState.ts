import {XmlElementNode} from 'simple_xml';
import {InsertablePositions} from './insertablePositions';
import {XmlEditorConfig, XmlSingleEditableNodeConfig} from './editorConfig';

// Default state

export interface DefaultEditorState {
  _type: 'DefaultEditorState';
}

export const defaultRightSideState: DefaultEditorState = {
  _type: 'DefaultEditorState'
};

// Edit node state

export interface IEditNodeEditorState<T> {
  _type: 'EditNodeRightState';
  node: XmlElementNode;
  data: T;
  changed: boolean;
  path: number[];
}

export function editNodeEditorState<T>(node: XmlElementNode, editorConfig: XmlEditorConfig, path: number[]): IEditNodeEditorState<T> {

  const config = editorConfig.nodeConfigs[node.tagName] as XmlSingleEditableNodeConfig<T>;

  return {_type: 'EditNodeRightState', node, data: config.readNode(node), path, changed: false};
}

// Add node state

export interface IAddNodeEditorState {
  _type: 'AddNodeRightState';
  tagName: string;
  insertablePositions: InsertablePositions;
}

export function addNodeEditorState(tagName: string, insertablePositions: InsertablePositions): IAddNodeEditorState {
  return {_type: 'AddNodeRightState', tagName, insertablePositions};
}

// Compare changes state

export interface ICompareChangesEditorState {
  _type: 'CompareChangesEditorState';
}

export const compareChangesEditorState: ICompareChangesEditorState = {
  _type: 'CompareChangesEditorState'
};

// right side state

export type EditorState<T> = DefaultEditorState | IEditNodeEditorState<T> | IAddNodeEditorState | ICompareChangesEditorState;
