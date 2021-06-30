import React, {useState} from 'react';
import {FileLoader} from './forms/FileLoader';
import {useTranslation} from 'react-i18next';
import {Change, diffLines} from 'diff';

interface IState {
  firstFile?: ReadFile;
  secondFile?: ReadFile;
  changes?: Change[];
}

interface ReadFile {
  name: string;
  content: string[];
}

export function XmlComparator(): JSX.Element {

  const {t} = useTranslation('common');
  const [state, setState] = useState<IState>({});

  function updateState(firstFile: ReadFile | undefined, secondFile: ReadFile | undefined): IState {
    if (firstFile && secondFile) {
      const changes = diffLines(firstFile.content.join('\n'), secondFile.content.join('\n'));

      return {firstFile, secondFile, changes};
    } else {
      return {firstFile, secondFile};
    }
  }

  async function readFile(file: File): Promise<ReadFile> {
    const xmlContent = await file.text();

    const content = new XMLSerializer().serializeToString(new DOMParser().parseFromString(xmlContent, 'text/xml'))
      .split('\n')
      .filter((s) => s.trim().length > 0);

    // const content = formatXml(xmlContent, {indentation: '  ', collapseContent: true, lineSeparator: '\n'}).split('\n');

    return {name: file.name, content};
  }

  async function setFirstFile(file: File): Promise<void> {
    const firstFile = await readFile(file);
    setState(({secondFile}) => updateState(firstFile, secondFile));
  }

  async function setSecondFile(file: File): Promise<void> {
    const secondFile = await readFile(file);
    setState(({firstFile}) => updateState(firstFile, secondFile));
  }

  return (
    <div className="container is-fluid">
      <h1 className="title is-3 has-text-centered">{t('xmlComparator')}</h1>

      <div className="columns">
        <div className="column">
          {state.firstFile
            ? <div className="has-text-danger">{state.firstFile.name}</div>
            : <FileLoader onLoad={setFirstFile}/>}
        </div>
        <div className="column">
          {state.secondFile
            ? <div className="has-text-success">{state.secondFile.name}</div>
            : <FileLoader onLoad={setSecondFile}/>}
        </div>
      </div>

      {state.changes && <div>
        {state.changes.map(({value, added, removed}, index) => {

          const className = added ? 'has-text-success' : removed ? 'has-text-danger' : '';

          return value
            .split('\n')
            .map((line, lineIndex) =>
              <p style={{wordBreak: 'break-all'}} className={className} key={index + '_' + lineIndex}>{line.replaceAll(' ', '\u00a0')}</p>
            );
        })}
      </div>}
    </div>
  );
}