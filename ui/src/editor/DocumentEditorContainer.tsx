import React, {useState} from 'react';
import {FileLoader} from '../forms/FileLoader';
import {XmlNode} from './xmlModel';
import {NewDocumentEditor} from './NewDocumentEditor';
import {loadNewXml} from './xmlLoader';


function handleSaveToPC(data: string, filename: string): void {
  const blob = new Blob([data], {type: 'text/plain'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.download = filename;
  link.href = url;
  link.click();
}

interface IState {
  rootNode: XmlNode;
  filename: string;
}

export function DocumentEditorContainer(): JSX.Element {

  const [state, setState] = useState<IState | undefined>();

  async function readFile(file: File): Promise<void> {
    const newXmlResult = await loadNewXml(file);
    setState({rootNode: newXmlResult, filename: file.name});
  }

  function download(content: string): void {
    state && handleSaveToPC(content, state.filename);
  }

  return (
    <div className="container is-fluid">
      {state
        ? <NewDocumentEditor node={state.rootNode} download={download}/>
        : <FileLoader accept="text/xml" onLoad={readFile}/>}
    </div>
  );
}