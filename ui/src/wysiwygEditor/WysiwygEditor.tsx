import {useState} from 'react';
import {ContentState, Editor, EditorState, RichUtils} from 'draft-js';
import 'draft-js/dist/Draft.css';
import './MyDraft.css';
import {exportFromDraft} from './exportFromDraft';
import {InlineStyle, inlineStyles, styleMap} from './wysiwygStyle';

const defaultText = `Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
`.repeat(5).trim();


export function WysiwygEditor(): JSX.Element {

  const [editorState, setEditorState] = useState(EditorState.createWithContent(ContentState.createFromText(defaultText)));

  const exportPreview = exportFromDraft(editorState).join('\n');

  function applyInlineStyle(value: InlineStyle): () => void {
    return () => setEditorState((state) => {

      const currentInlineStyles: Immutable.OrderedSet<string> = state.getCurrentInlineStyle();

      if (currentInlineStyles.isEmpty()) {
        return RichUtils.toggleInlineStyle(state, value);
      } else if (currentInlineStyles.contains(value)) {
        return RichUtils.toggleInlineStyle(state, value);
      } else {
        // TODO: remove all old style(s)!
        const emptyInlineStyleState = currentInlineStyles.reduce<EditorState>(
          (newState, currentInlineStyle) => currentInlineStyle ? RichUtils.toggleInlineStyle(newState!, currentInlineStyle) : newState!,
          state
        );

        return RichUtils.toggleInlineStyle(emptyInlineStyleState, value);
      }
    });
  }

  function onChange(editorState: EditorState): void {
    setEditorState(editorState);
  }

  return (
    <div className="container mx-auto">
      <div className="mb-2">
        {inlineStyles.map((inlineStyle) =>
          <button key={inlineStyle} type="button" onClick={applyInlineStyle(inlineStyle)}
                  className="mr-2 p-2 border border-slate-200 font-bold">{inlineStyle}</button>
        )}
        <button type="button" onClick={() => exportFromDraft(editorState)} className="mr-2 p-2 border border-slate-200 font-bold">Export</button>
      </div>

      <Editor editorState={editorState} onChange={onChange} customStyleMap={styleMap}/>

      <pre className="mt-4">{exportPreview}</pre>
    </div>
  );
}
