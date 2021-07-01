import React, {useState} from 'react';
import {FileLoader} from '../forms/FileLoader';
import {useTranslation} from 'react-i18next';
import {Change, diffLines} from 'diff';
import {allXmlComparatorConfig, emptyXmlComparatorConfig, makeReplacements, XmlComparatorConfig} from './xmlComparatorConfig';
import {BulmaObjectSelect, SelectOption} from '../forms/BulmaFields';

interface IState {
  config: XmlComparatorConfig;
  firstFile?: ReadFile;
  secondFile?: ReadFile;
  changes?: Change[];
}

interface ReadFile {
  name: string;
  baseContent: string;
}

function beautifyXml(content: string): string {
  return new XMLSerializer().serializeToString(new DOMParser().parseFromString(content, 'text/xml'));
}

export function XmlComparator(): JSX.Element {

  const {t} = useTranslation('common');
  const [state, setState] = useState<IState>({config: emptyXmlComparatorConfig});

  function updateState(config: XmlComparatorConfig, firstFile: ReadFile | undefined, secondFile: ReadFile | undefined): IState {
    if (!firstFile || !secondFile) {
      return {config, firstFile, secondFile};
    }

    const firstFileContent = makeReplacements(firstFile.baseContent, config);
    const secondFileContent = makeReplacements(secondFile.baseContent, config);

    const changes = diffLines(firstFileContent, secondFileContent);

    return {config, firstFile, secondFile, changes};
  }

  async function readFile(file: File): Promise<ReadFile> {
    const xmlContent = await file.text();

    return {name: file.name, baseContent: beautifyXml(xmlContent)};
  }

  async function setFirstFile(file: File): Promise<void> {
    const firstFile = await readFile(file);
    setState(({config, secondFile}) => updateState(config, firstFile, secondFile));
  }

  async function setSecondFile(file: File): Promise<void> {
    const secondFile = await readFile(file);
    setState(({config, firstFile}) => updateState(config, firstFile, secondFile));
  }

  const xmlConfigOptions: SelectOption<XmlComparatorConfig>[] = allXmlComparatorConfig.map((option) => ({value: option, label: option.name}));

  function updateXmlConfigOption(config: XmlComparatorConfig): void {
    setState(({firstFile, secondFile}) => updateState(config, firstFile, secondFile));
  }

  return (
    <div className="container is-fluid">
      <h1 className="title is-3 has-text-centered">{t('xmlComparator')}</h1>

      <div className="columns">
        <div className="column">
          {state.firstFile
            ? <div className="has-text-danger has-text-centered">{state.firstFile.name}</div>
            : <FileLoader onLoad={setFirstFile}/>}
        </div>
        <div className="column">
          <BulmaObjectSelect label={t('xmlComparatorConfig')} id="xmlComparatorConfig" currentValue={state.config} options={xmlConfigOptions}
                             onUpdate={updateXmlConfigOption}/>
        </div>
        <div className="column">
          {state.secondFile
            ? <div className="has-text-success has-text-centered">{state.secondFile.name}</div>
            : <FileLoader onLoad={setSecondFile}/>}
        </div>
      </div>

      {state.changes && <div>
        {state.changes.map(({value, added, removed}, index) => {

          const className = added ? 'has-text-success' : removed ? 'has-text-danger' : '';

          return value
            .split('\n')
            .map((line, lineIndex) =>
              <p style={{wordBreak: 'break-all'}} className={className}
                 key={state.config.name + '_' + index + '_' + lineIndex}>{line.replaceAll(' ', '\u00a0')}</p>
            );
        })}
      </div>}
    </div>
  );
}