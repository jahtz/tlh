import {useTranslation} from 'react-i18next';
import {FileLoader} from '../forms/FileLoader';
import {useState} from 'react';
import update from 'immutability-helper';
import {DocumentMerger} from './DocumentMerger';
import {loadNewXml} from '../xmlEditor/xmlModel/xmlReading';
import {MergeDocument, MergeLine, readMergeDocument} from './mergeDocument';
import {XmlElementNode} from '../xmlEditor/xmlModel/xmlModel';
import {isLeft} from '../xmlEditor/either';
import {MergedDocumentView} from './MergedDocumentView';

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
}

interface SecondFileLoadedState {
  _type: 'SecondFileLoadedState';
  firstFile: MergeFile;
  secondFile: MergeFile;
}

interface MergedState {
  _type: 'MergedState';
  mergedLines: MergeLine[];
}

type IState = EmptyState | FirstFileLoadedState | SecondFileLoadedState | MergedState;


export function DocumentMergerContainer(): JSX.Element {

  const {t} = useTranslation('common');
  const [state, setState] = useState<IState>({_type: 'EmptyState'});

  async function loadFirstDocument(file: File): Promise<void> {
    const parseResult = await loadNewXml(file);

    if (isLeft(parseResult)) {
      alert(parseResult.value);
    } else {
      const document: MergeDocument = readMergeDocument(parseResult.value as XmlElementNode);

      setState((state) => update(state, {
        _type: {$set: 'FirstFileLoadedState'},
        firstFile: {$set: {filename: file.name, document}}
      }));
    }
  }

  async function loadSecondDocument(file: File): Promise<void> {
    const parseResult = await loadNewXml(file);

    if (isLeft(parseResult)) {
      alert(parseResult.value);
    } else {
      const document: MergeDocument = readMergeDocument(parseResult.value as XmlElementNode);

      setState((state) => update(state, {
        _type: {$set: 'SecondFileLoadedState'},
        secondFile: {$set: {filename: file.name, document}}
      }));
    }
  }

  function onMerge(mergedLines: MergeLine[]): void {
    setState((state) => update(state, {
      $set: {_type: 'MergedState', mergedLines}
    }));
  }

  return (
    <div className="container mx-auto">
      <h1 className="font-bold text-2xl text-center mb-2">{t('documentMerger')}</h1>

      {'firstFile' in state && <div className="grid grid-cols-2 gap-2 my-2">
        <button type="button" className="p-2 rounded border border-slate-500">{state.firstFile.filename}</button>
        {'secondFile' in state && <button type="button" className="p-2 rounded border border-slate-500">{state.secondFile.filename}</button>}
      </div>}

      {(state._type === 'EmptyState' && <FileLoader onLoad={loadFirstDocument} accept={'text/xml'} text={t('loadFirstFile')}/>)
        || (state._type === 'FirstFileLoadedState' && <FileLoader onLoad={loadSecondDocument} accept={'text/xml'} text={t('loadSecondFile')}/>)
        || (state._type === 'SecondFileLoadedState' &&
          <DocumentMerger firstDocument={state.firstFile.document} secondDocument={state.secondFile.document} onMerge={onMerge}/>)
        || (state._type === 'MergedState' && <MergedDocumentView lines={state.mergedLines}/>)}

    </div>
  );
}