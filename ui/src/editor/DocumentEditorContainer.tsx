import {useState} from 'react';
import {FileLoader} from '../forms/FileLoader';
import {XmlNode} from './xmlModel/xmlModel';
import {NewDocumentEditor} from './NewDocumentEditor';
import classNames from 'classnames';
import {loadNewXml} from './xmlModel/xmlReading';

function handleSaveToPC(data: string, filename: string): void {
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

export function DocumentEditorContainer(): JSX.Element {

  const [state, setState] = useState<LoadedDocument | undefined>();

  async function readFile(file: File): Promise<void> {
    setState({rootNode: await loadNewXml(file), filename: file.name});
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