import {JSX, useState} from 'react';
import {FileLoader} from '../forms/FileLoader';
import {findFirstXmlElementByTagName, isLeft, loadNewXml, writeNode, xmlElementNode, XmlElementNode, XmlNode} from 'simple_xml';
import {XmlDocumentEditor} from './XmlDocumentEditor';
import {XmlEditorConfig} from './editorConfig';
import {useTranslation} from 'react-i18next';
import {tlhXmlEditorConfig} from './tlhXmlEditorConfig';

const locStoreKey = (documentType: DocumentType): string => `editorState_${documentType}`;

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

interface IState {
  document: LoadedDocument | undefined;
  author: string | undefined;
}

function initialState(documentType: DocumentType): LoadedDocument | undefined {
  const maybeEditorState = localStorage.getItem(locStoreKey(documentType));

  return maybeEditorState
    ? JSON.parse(maybeEditorState)
    : undefined;
}

const autoSave = (documentType: DocumentType, filename: string, rootNode: XmlNode): void =>
  localStorage.setItem(locStoreKey(documentType), JSON.stringify({filename, rootNode}));

type DocumentType = 'transliteration' | 'transcription';

interface IProps {
  editorConfig: XmlEditorConfig;
  documentType: DocumentType;
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

export function StandAloneOXTED({editorConfig, documentType}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [state, setState] = useState<LoadedDocument | undefined>(initialState(documentType));
  const [authorState, setAuthorState] = useState<string>();

  async function readFile(file: File): Promise<void> {
    const parseResult = await loadNewXml(file, editorConfig.readConfig);

    if (isLeft(parseResult)) {
      alert(parseResult.value);
    } else {
      setState({rootNode: parseResult.value, filename: file.name});
    }
  }

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
    localStorage.removeItem(locStoreKey(documentType));
  }

  return (
    <div className="h-full max-h-full">
      {state
        ? <XmlDocumentEditor node={state.rootNode} editorConfig={editorConfig} onExport={download} filename={state.filename} closeFile={closeFile}
                             autoSave={(node) => autoSave(documentType, state.filename, node)}/>
        : (
          <div className="container mx-auto">
            <FileLoader accept="text/xml" onLoad={readFile}/>
          </div>
        )}
    </div>
  );
}