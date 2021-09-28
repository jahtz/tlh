import React, {useState} from 'react';
import {FileLoader} from '../forms/FileLoader';
import {XmlNode} from './xmlModel/xmlModel';
import {NewDocumentEditor} from './NewDocumentEditor';
import {loadNewXml} from './xmlModel/xmlLoader';
import classNames from 'classnames';

function handleSaveToPC(data: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = URL.createObjectURL(
    new Blob([data], {type: 'text/plain'})
  );
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
    <div className={classNames('container', {'is-fluid': state})}>
      {state
        ? <NewDocumentEditor node={state.rootNode} download={download} filename={state.filename} closeFile={() => setState(undefined)}/>
        : <FileLoader accept="text/xml" onLoad={readFile}/>}
    </div>
  );
}