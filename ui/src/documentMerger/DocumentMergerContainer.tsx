import {useTranslation} from 'react-i18next';
import {FileLoader} from '../forms/FileLoader';
import {useState} from 'react';
import update from 'immutability-helper';
import {DocumentMerger} from './DocumentMerger';
import {LoadedDocument} from '../editor/DocumentEditorContainer';
import {loadNewXml} from '../editor/xmlModel/xmlReading';


interface IState {
  firstFile?: LoadedDocument;
  secondFile?: LoadedDocument;
}

export function DocumentMergerContainer(): JSX.Element {

  const {t} = useTranslation('common');
  const [state, setState] = useState<IState>({});

  async function loadFirstDocument(file: File): Promise<void> {
    const rootNode = await loadNewXml(file);
    setState((state) => update(state, {firstFile: {$set: {filename: file.name, rootNode}}}));
  }

  async function loadSecondDocument(file: File): Promise<void> {
    const rootNode = await loadNewXml(file);
    setState((state) => update(state, {secondFile: {$set: {filename: file.name, rootNode}}}));
  }

  return (
    <div className="container">
      <h1 className="title has-text-centered">{t('documentMerger')}</h1>

      <div className="field has-addons">
        <div className="control is-expanded">
          <button type="button" className="button is-static is-fullwidth">{state.firstFile?.filename}</button>
        </div>
        <div className="control is-expanded">
          <button type="button" className="button is-static is-fullwidth">{state.secondFile?.filename}</button>
        </div>
      </div>

      {state.firstFile
        ? <>
          {state.secondFile
            ? <DocumentMerger firstRootNode={state.firstFile.rootNode} secondRootNode={state.secondFile.rootNode}/>
            : <FileLoader onLoad={loadSecondDocument} accept={'text/xml'} text={t('loadSecondFile')}/>}
        </>
        : <FileLoader onLoad={loadFirstDocument} accept={'text/xml'} text={t('loadFirstFile')}/>}
    </div>
  );
}