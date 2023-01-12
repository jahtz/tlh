export interface EditorKeyConfig {
  updateAndNextEditableNodeKeys: string[];
  nextEditableNodeKeys: string[];
  updateAndPreviousEditableNodeKeys: string[];
  previousEditableNodeKeys: string[];
  submitChangeKeys: string[];
}

export const defaultEditorKeyConfig: EditorKeyConfig = {
  updateAndNextEditableNodeKeys: ['w'],
  nextEditableNodeKeys: [],
  updateAndPreviousEditableNodeKeys: ['q'],
  previousEditableNodeKeys: [],
  submitChangeKeys: ['Enter', 'd']
};