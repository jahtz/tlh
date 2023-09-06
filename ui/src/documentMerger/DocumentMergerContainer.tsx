import {useTranslation} from 'react-i18next';
import {FileLoader} from '../forms/FileLoader';
import {JSX, useState} from 'react';
import update from 'immutability-helper';
import {DocumentMerger} from './DocumentMerger';
import {PublicationMap} from './publicationMap';
import {loadNewXml, XmlElementNode} from 'simple_xml';
import {MergeDocument, mergeHeader, MergeLine, readMergeDocument} from './mergeDocument';
import {MergedDocumentView} from './MergedDocumentView';
import {tlhXmlEditorConfig} from '../xmlEditor/tlhXmlEditorConfig';
import {DocumentMergerDescription} from './DocumentMergerDescription';

interface MergeFile {
  filename: string;
  document: MergeDocument;
}

type EmptyState = {
  _type: 'EmptyState';
};

interface FirstFileLoadedState {
  _type: 'FirstFileLoadedState';
  firstFile: MergeFile;
  firstHeader: MergeFile;
}

interface SecondFileLoadedState {
  _type: 'SecondFileLoadedState';
  firstFile: MergeFile;
  secondFile: MergeFile;
}

interface MergedState {
  _type: 'MergedState';
  mergedLines: MergeLine[];
  header: XmlElementNode;
  publicationMapping: PublicationMap;
}

type IState = EmptyState | FirstFileLoadedState | SecondFileLoadedState | MergedState;

export function DocumentMergerContainer(): JSX.Element {

  const {t} = useTranslation('common');
  const [state, setState] = useState<IState>({_type: 'EmptyState'});

  const loadFirstDocument = async (file: File): Promise<void> => {
    try {
      const parseResult = await loadNewXml(file, tlhXmlEditorConfig.readConfig);

      parseResult.handle(
        (rootNode) => setState((state) => update(state, {
          _type: {$set: 'FirstFileLoadedState'},
          firstFile: {$set: {filename: file.name, document: readMergeDocument(rootNode as XmlElementNode)}}
        })),
        (value) => alert(value)
      );
    } catch (exception) {
      console.error(exception);
    }
  };

  const loadSecondDocument = async (file: File): Promise<void> => {
    try {
      const parseResult = await loadNewXml(file, tlhXmlEditorConfig.readConfig);

      parseResult.handle(
        (rootNode) =>
          setState((state) => update(state, {
            _type: {$set: 'SecondFileLoadedState'},
            secondFile: {$set: {filename: file.name, document: readMergeDocument(rootNode as XmlElementNode)}}
          })),
        (value) => alert(value)
      );
    } catch (exception) {
      console.error(exception);
    }
  };

  function onMerge(mergedLines: MergeLine[], publicationMapping: PublicationMap): void {
    if ('firstFile' in state && 'secondFile' in state) {
      const header = mergeHeader(state.firstFile.document.header, state.secondFile.document.header);

      setState((state) => update(state, {$set: {_type: 'MergedState', mergedLines, header, publicationMapping}}));
    }
  }

  return (
    <div className="container mx-auto">
      <h1 className="font-bold text-2xl text-center mb-2">{t('documentMerger')}</h1>

      {!('firstFile' in state) && <DocumentMergerDescription/>}

      {'firstFile' in state && <div className="grid grid-cols-2 gap-2 my-2">
        <button type="button" className="p-2 rounded border border-slate-500">{state.firstFile.filename}</button>
        {'secondFile' in state && <button type="button" className="p-2 rounded border border-slate-500">{state.secondFile.filename}</button>}
      </div>}

      {(state._type === 'EmptyState' && <FileLoader onLoad={loadFirstDocument} accept={'text/xml'} text={t('loadFirstFile') || 'loadFirstFile'}/>)
        || (state._type === 'FirstFileLoadedState' &&
          <FileLoader onLoad={loadSecondDocument} accept={'text/xml'} text={t('loadSecondFile') || 'loadSecondFile'}/>)
        || (state._type === 'SecondFileLoadedState' &&
          <DocumentMerger firstDocument={state.firstFile.document} secondDocument={state.secondFile.document}
                          mergedPublicationMapping={state.secondFile.document.mergedPublicationMapping} onMerge={onMerge}/>)
        || (state._type === 'MergedState' &&
          <MergedDocumentView lines={state.mergedLines} header={state.header} publicationMapping={state.publicationMapping}/>)}

    </div>
  );
}