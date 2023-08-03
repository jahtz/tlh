import {ReactElement, useState} from 'react';
import {FileLoader} from '../forms/FileLoader';
import {findFirstXmlElementByTagName, loadNewXml, writeNode, xmlElementNode, XmlElementNode, XmlNode} from 'simple_xml';
import {XmlDocumentEditor} from './XmlDocumentEditor';
import {XmlEditorConfig} from './editorConfig';
import {useTranslation} from 'react-i18next';
import {tlhXmlEditorConfig} from './tlhXmlEditorConfig';
import {allDocEditTypes, DocumentEditTypes} from './documentEditTypes';
import update from 'immutability-helper';
import classNames from 'classnames';

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

export const writeXml = (node: XmlElementNode): string => tlhXmlEditorConfig.afterExport(writeNode(tlhXmlEditorConfig.beforeExport(node), tlhXmlEditorConfig.writeConfig).join('\n'));

interface ExportData {
  author: string | undefined;
  editType: DocumentEditTypes;
}

export function StandAloneOXTED({editorConfig}: IProps): ReactElement {

  const {t} = useTranslation('common');
  const [loadedDocument, setLoadedDocument] = useState<LoadedDocument | undefined>(initialState());
  const [{author, editType}, setExportData] = useState<ExportData>({author: undefined, editType: DocumentEditTypes.Annotation});

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

    if (author === undefined) {
      alert(t('pleaseSpecifyAuthor'));
      return;
    }

    // set update type
    const newNode = xmlElementNode(editType, {editor: author, date: (new Date()).toISOString()});

    const annotationNode = findFirstXmlElementByTagName(rootNode, 'annotation');
    if (annotationNode === undefined) {
      alert('Internal error!');
      return;
    }
    annotationNode.children.push(newNode);

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
            <div className="my-4 p-2 rounded border border-slate-500">
              <h2 className="text-center font-bold">{t('exportData')}</h2>

              <div>
                <label htmlFor="author" className="font-bold">{t('author')}:</label>
                <input type="text" id="author" defaultValue={author} placeholder={t('author')}
                       className={classNames('my-2 p-2 rounded border w-full', author === undefined ? 'border-red-500' : 'border-slate-500')}
                       onChange={(event) => setExportData((exportData) => update(exportData, {author: {$set: event.target.value}}))}/>
              </div>

              <div>
                <label htmlFor="editType" className="font-bold">{t('editType')}:</label>
                <select id="editType" className="my-2 p-2 rounded border border-slate-500 bg-white w-full" defaultValue={editType}
                        onChange={(event) => setExportData((exportData) => update(exportData, {editType: {$set: event.target.value as DocumentEditTypes}}))}>
                  {allDocEditTypes.map((docEditType) => <option key={docEditType}>{docEditType}</option>)}
                </select>
              </div>
            </div>
          </XmlDocumentEditor>
        ) : (
          <div className="container mx-auto">
            <FileLoader accept="text/xml" onLoad={readFile}/>
          </div>
        )}
    </div>
  );
}