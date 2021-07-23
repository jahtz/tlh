export interface EditorConfig {
  nextEditableNodeKeys: string[];
  previousEditableNodeKeys: string[];
  submitChangeKeys: string[];
}

export const defaultEditorConfig: EditorConfig = {
  nextEditableNodeKeys: ['w'],
  previousEditableNodeKeys: ['q'],
  submitChangeKeys: ['Enter', 'd']
};