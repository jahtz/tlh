import {useState} from 'react';
import {FileLoader} from '../forms/FileLoader';
import {XmlNode} from '../xmlModel/xmlModel';
import {XmlDocumentEditor} from './XmlDocumentEditor';
import {loadNewXml} from '../xmlModel/xmlReading';
import {isLeft} from '../xmlModel/either';
import {XmlEditorConfig} from './editorConfig';

const localStorageEditorStateKey = 'editorState';

export function handleSaveToPC(data: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = URL.createObjectURL(
    new Blob([data], {type: 'text/plain'})
  );
  link.click();
}

interface LoadedDocument {
  filename: string;
  rootNode: XmlNode;
}

function initialState(): LoadedDocument | undefined {
  const maybeEditorState = localStorage.getItem(localStorageEditorStateKey);

  return maybeEditorState
    ? JSON.parse(maybeEditorState)
    : undefined;
}

function autoSave(filename: string, rootNode: XmlNode): void {
  localStorage.setItem(localStorageEditorStateKey, JSON.stringify({filename, rootNode}));
}

interface IProps {
  editorConfig: XmlEditorConfig;
}

export function XmlDocumentEditorContainer({editorConfig}: IProps): JSX.Element {

  const [state, setState] = useState<LoadedDocument | undefined>(initialState());

  async function readFile(file: File): Promise<void> {
    const parseResult = await loadNewXml(file);

    if (isLeft(parseResult)) {
      alert(parseResult.value);
    } else {
      setState({rootNode: parseResult.value, filename: file.name});
    }
  }

  function download(content: string): void {
    state && handleSaveToPC(content, state.filename);
  }

  function closeFile(): void {
    setState(undefined);
    localStorage.removeItem(localStorageEditorStateKey);
  }

  return (
    <div className="h-full max-h-full">
      {state
        ? <XmlDocumentEditor node={state.rootNode} editorConfig={editorConfig} download={download} filename={state.filename} closeFile={closeFile}
                             autoSave={(node) => autoSave(state.filename, node)}/>
        : (
          <div className="container mx-auto">
            <FileLoader accept="text/xml" onLoad={readFile}/>
            {/* TODO: let users open recently closed files? */}
          </div>
        )}
    </div>
  );
}