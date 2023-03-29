import {XmlElementNode} from 'simple_xml';
import {InsertablePositions} from './insertablePositions';
import {XmlEditorConfig} from './editorConfig';

// Default state

export interface DefaultEditorState {
  _type: 'DefaultEditorState';
}

export const defaultRightSideState: DefaultEditorState = {
  _type: 'DefaultEditorState'
};

// Edit node state

export interface IEditNodeEditorState {
  _type: 'EditNodeRightState';
  node: XmlElementNode;
  changed: boolean;
  path: number[];
}

export function editNodeEditorState(node: XmlElementNode, editorConfig: XmlEditorConfig, path: number[]): IEditNodeEditorState {
  return {_type: 'EditNodeRightState', node, path, changed: false};
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

export type EditorState = DefaultEditorState | IEditNodeEditorState | IAddNodeEditorState | ICompareChangesEditorState;
