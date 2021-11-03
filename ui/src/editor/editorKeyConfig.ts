export interface EditorKeyConfig {
  nextEditableNodeKeys: string[];
  previousEditableNodeKeys: string[];
  submitChangeKeys: string[];
}

export const defaultEditorKeyConfig: EditorKeyConfig = {
  nextEditableNodeKeys: ['w'],
  previousEditableNodeKeys: ['q'],
  submitChangeKeys: ['Enter', 'd']
};