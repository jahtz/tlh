import {ReactElement, useState} from 'react';
import {FileLoader} from '../forms/FileLoader';
import {findFirstXmlElementByTagName, loadNewXml, writeNode, XmlElementNode, XmlNode} from 'simple_xml';
import {XmlDocumentEditor} from './XmlDocumentEditor';
import {XmlEditorConfig} from './editorConfig';
import {useTranslation} from 'react-i18next';
import {tlhXmlEditorConfig} from './tlhXmlEditorConfig';
import {OxtedExportData} from './OxtedExportData';

const locStoreKey = 'editorState';

export function handleSaveToPC(data: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = URL.createObjectURL(
    new Blob([data], {type: 'text/plain'})
  );
  link.click();
}

interface IProps {
  editorConfig: XmlEditorConfig;
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

export const writeXml = (node: XmlElementNode): string => tlhXmlEditorConfig.afterExport(writeNode(tlhXmlEditorConfig.beforeExport(node), tlhXmlEditorConfig.writeConfig).join('\n'));

export function StandAloneOXTED({editorConfig}: IProps): ReactElement {

  const {t} = useTranslation('common');
  const [loadedDocument, setLoadedDocument] = useState<LoadedDocument | undefined>(initialState());
  const [exportAddNode, setExportAddNode] = useState<XmlElementNode>();

  const readFile = async (file: File) => {
    const parseResult = await loadNewXml(file, editorConfig.readConfig);

    parseResult.handle(
      (rootNode) => setLoadedDocument({rootNode, filename: file.name}),
      (value) => alert(value)
    );
  };

  function download(rootNode: XmlElementNode): void {
    if (loadedDocument === undefined) {
      return;
    }

    if (exportAddNode === undefined) {
      alert(t('pleaseSpecifyAuthor'));
      return;
    }

    // set update type

    const annotationNode = findFirstXmlElementByTagName(rootNode, 'annotation');
    if (annotationNode === undefined) {
      alert('Internal error!');
      return;
    }
    annotationNode.children.push(exportAddNode);

    handleSaveToPC(writeXml(rootNode), loadedDocument.filename);
  }

  function closeFile(): void {
    setLoadedDocument(undefined);
    localStorage.removeItem(locStoreKey);
  }

  return (
    <div className="h-full max-h-full">
      {loadedDocument
        ? (
          <XmlDocumentEditor node={loadedDocument.rootNode} editorConfig={editorConfig} onExport={download} filename={loadedDocument.filename}
                             closeFile={closeFile} autoSave={(node) => autoSave(loadedDocument.filename, node)}>
            <OxtedExportData setExportNode={setExportAddNode}/>
          </XmlDocumentEditor>
        ) : (
          <div className="container mx-auto">
            <FileLoader accept="text/xml" onLoad={readFile}/>
          </div>
        )}
    </div>
  );
}