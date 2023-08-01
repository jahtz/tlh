import {JSX, useState} from 'react';
import {FileLoader} from '../forms/FileLoader';
import {findFirstXmlElementByTagName, loadNewXml, writeNode, xmlElementNode, XmlElementNode, XmlNode} from 'simple_xml';
import {XmlDocumentEditor} from './XmlDocumentEditor';
import {XmlEditorConfig} from './editorConfig';
import {useTranslation} from 'react-i18next';
import {tlhXmlEditorConfig} from './tlhXmlEditorConfig';

const locStoreKey = 'editorState';

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
  const maybeEditorState = localStorage.getItem(locStoreKey);

  return maybeEditorState
    ? JSON.parse(maybeEditorState)
    : undefined;
}

const autoSave = (filename: string, rootNode: XmlNode): void => localStorage.setItem(locStoreKey, JSON.stringify({filename, rootNode}));

interface IProps {
  editorConfig: XmlEditorConfig;
}

function addAuthorNode(rootNode: XmlElementNode, editor: string): XmlElementNode {

  const annotationNode = findFirstXmlElementByTagName(rootNode, 'annotation');

  if (annotationNode === undefined) {
    throw new Error('No annotation node found!');
  }

  annotationNode.children.push(xmlElementNode('annot', {editor, date: (new Date()).toISOString()}));

  return rootNode;
}

export const writeXml = (node: XmlElementNode): string => tlhXmlEditorConfig.afterExport(writeNode(tlhXmlEditorConfig.beforeExport(node), tlhXmlEditorConfig.writeConfig).join('\n'));

export function StandAloneOXTED({editorConfig}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [state, setState] = useState<LoadedDocument | undefined>(initialState());
  const [authorState, setAuthorState] = useState<string>();

  const readFile = (file: File): Promise<void> => loadNewXml(file, editorConfig.readConfig)
    .then((parseResult) =>
      parseResult.handle(
        (rootNode) => setState({rootNode, filename: file.name}),
        (value) => alert(value)
      )
    );

  function download(rootNode: XmlElementNode): void {
    if (state === undefined) {
      return;
    }

    let author: string | null | undefined = authorState;

    if (!author) {
      author = prompt(t('authorAbbreviation?') || 'authorAbbreviation?');

      if (!author) {
        alert(t('noExportWithoutAuthor'));
        return;
      }

      setAuthorState(author);
    }

    handleSaveToPC(writeXml(addAuthorNode(rootNode, author)), state.filename);
  }

  function closeFile(): void {
    setState(undefined);
    localStorage.removeItem(locStoreKey);
  }

  return (
    <div className="h-full max-h-full">
      {state
        ? <XmlDocumentEditor node={state.rootNode} editorConfig={editorConfig} onExport={download} filename={state.filename} closeFile={closeFile}
                             autoSave={(node) => autoSave(state.filename, node)}/>
        : (
          <div className="container mx-auto">
            <FileLoader accept="text/xml" onLoad={readFile}/>
          </div>
        )}
    </div>
  );
}