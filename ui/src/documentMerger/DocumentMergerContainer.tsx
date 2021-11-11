import {useTranslation} from 'react-i18next';
import {FileLoader} from '../forms/FileLoader';
import {useState} from 'react';
import update from 'immutability-helper';
import {DocumentMerger, MergeDocumentLine} from './DocumentMerger';
import {loadNewXml} from '../editor/xmlModel/xmlReading';
import {MergeDocument, MergeLine, readMergeDocument} from './mergeDocument';
import {XmlElementNode} from '../editor/xmlModel/xmlModel';

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
    const document = readMergeDocument(await loadNewXml(file) as XmlElementNode);
    setState((state) => update(state, {
      _type: {$set: 'FirstFileLoadedState'},
      firstFile: {$set: {filename: file.name, document}}
    }));
  }

  async function loadSecondDocument(file: File): Promise<void> {
    const document = readMergeDocument(await loadNewXml(file) as XmlElementNode);
    setState((state) => update(state, {
      _type: {$set: 'SecondFileLoadedState'},
      secondFile: {$set: {filename: file.name, document}}
    }));
  }

  function onMerge(mergedLines: MergeLine[]): void {
    setState((state) => update(state, {
      $set: {_type: 'MergedState', mergedLines}
    }));
  }

  return (
    <div className="container">
      <h1 className="title has-text-centered">{t('documentMerger')}</h1>

      <div className="field has-addons">
        <div className="control is-expanded">
          <button type="button" className="button is-static is-fullwidth">{'firstFile' in state && state.firstFile.filename}</button>
        </div>
        <div className="control is-expanded">
          <button type="button" className="button is-static is-fullwidth">{'secondFile' in state && state.secondFile?.filename}</button>
        </div>
      </div>

      {(state._type === 'EmptyState' && <FileLoader onLoad={loadFirstDocument} accept={'text/xml'} text={t('loadFirstFile')}/>)
      || (state._type === 'FirstFileLoadedState' && <FileLoader onLoad={loadSecondDocument} accept={'text/xml'} text={t('loadSecondFile')}/>)
      || (state._type === 'SecondFileLoadedState' &&
        <DocumentMerger firstDocument={state.firstFile.document} secondDocument={state.secondFile.document} onMerge={onMerge}/>)
      || (state._type === 'MergedState' && <>
        {state.mergedLines.map((l, index) => <p key={index}><MergeDocumentLine line={l}/></p>)}
      </>)}

    </div>
  );
}