import {useState} from 'react';
import {FileLoader} from '../forms/FileLoader';
import {useTranslation} from 'react-i18next';
import {Change, diffLines} from 'diff';
import {allXmlComparatorConfig, emptyXmlComparatorConfig, makeReplacements, XmlComparatorConfig} from './xmlComparatorConfig';
import {BulmaObjectSelect, SelectOption} from '../forms/BulmaFields';
import classNames from 'classnames';

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

const leftColorClass = 'text-red-500';
const rightColorClass = 'text-green-500';

export function XmlComparator(): JSX.Element {

  const {t} = useTranslation('common');
  const [state, setState] = useState<IState>({config: emptyXmlComparatorConfig});

  function updateState({config, firstFile, secondFile}: IState): IState {
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
    setState((currentState) => updateState({...currentState, firstFile}));
  }

  async function setSecondFile(file: File): Promise<void> {
    const secondFile = await readFile(file);
    setState((currentState) => updateState({...currentState, secondFile}));
  }

  function updateXmlConfigOption(config: XmlComparatorConfig): void {
    setState((currentState) => updateState({...currentState, config}));
  }

  const xmlConfigOptions: SelectOption<XmlComparatorConfig>[] = allXmlComparatorConfig.map((option) => ({value: option, label: option.name}));

  return (
    <div className="container mx-auto">
      <h1 className="font-bold text-2xl text-center">{t('xmlComparator')}</h1>

      <div className="mt-2 grid grid-cols-3 gap-2">
        {state.firstFile
          ? <div className={classNames('text-center', 'underline', leftColorClass)}>{state.firstFile.name}</div>
          : <FileLoader onLoad={setFirstFile}/>}

        <BulmaObjectSelect label={t('xmlComparatorConfig')} id="xmlComparatorConfig" currentValue={state.config} options={xmlConfigOptions}
                           onUpdate={updateXmlConfigOption}/>
        {state.secondFile
          ? <div className={classNames('text-center', 'underline', rightColorClass)}>{state.secondFile.name}</div>
          : <FileLoader onLoad={setSecondFile}/>}
      </div>

      {state.changes && state.changes.map(({value, added, removed}, index) => {

        const className = added ? rightColorClass : removed ? leftColorClass : '';

        return value
          .split('\n')
          .map((line, lineIndex) =>
            <p style={{wordBreak: 'break-all'}} className={className} key={state.config.name + '_' + index + '_' + lineIndex}>
              {line.replaceAll(' ', '\u00a0')}
            </p>
          );
      })}
    </div>
  );
}