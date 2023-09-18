import {JSX, useState} from 'react';
import {FileLoader} from '../forms/FileLoader';
import {useTranslation} from 'react-i18next';
import {allXmlComparatorConfig, emptyXmlComparatorConfig, XmlComparatorConfig} from './xmlComparatorConfig';
import {ObjectSelect, SelectOption} from '../forms/ObjectSelect';
import classNames from 'classnames';
import {XmlComparator} from './XmlComparator';
import update from 'immutability-helper';

interface IState {
  config: XmlComparatorConfig;
  leftFile?: ReadFile;
  rightFile?: ReadFile;
}

export interface ReadFile {
  name: string;
  baseContent: string;
}

function beautifyXml(content: string): string {
  return new XMLSerializer().serializeToString(new DOMParser().parseFromString(content, 'text/xml'));
}

export const leftColorClass = 'text-red-500';
export const rightColorClass = 'text-green-500';

export function XmlComparatorContainer(): JSX.Element {

  const {t} = useTranslation('common');
  const [state, setState] = useState<IState>({config: emptyXmlComparatorConfig});

  async function readFile(file: File): Promise<ReadFile> {
    const xmlContent = await file.text();
    return {name: file.name, baseContent: beautifyXml(xmlContent)};
  }

  async function setLeftFile(file: File): Promise<void> {
    const leftFile = await readFile(file);
    setState((state) => update(state, {leftFile: {$set: leftFile}}));
  }

  async function setRightFile(file: File): Promise<void> {
    const rightFile = await readFile(file);
    setState((state) => update(state, {rightFile: {$set: rightFile}}));
  }

  function updateXmlConfigOption(config: XmlComparatorConfig): void {
    setState((state) => update(state, {config: {$set: config}}));
  }

  const xmlConfigOptions: SelectOption<XmlComparatorConfig>[] = allXmlComparatorConfig.map((option) => ({value: option, label: option.name}));

  return (
    <div className="container mx-auto">
      <h1 className="font-bold text-2xl text-center">{t('xmlComparator')}</h1>

      <div className="mt-2 grid grid-cols-3 gap-2">
        <FileLoader onLoad={setLeftFile}/>

        <ObjectSelect label={t('xmlComparatorConfig')} id="xmlComparatorConfig" currentValue={state.config} options={xmlConfigOptions}
                      onUpdate={updateXmlConfigOption}/>

        <FileLoader onLoad={setRightFile}/>
      </div>

      <p>
        {state.leftFile && <div className={classNames('text-center', 'underline', leftColorClass)}>{state.leftFile.name}</div>}
        {state.rightFile && <div className={classNames('text-center', 'underline', rightColorClass)}>{state.rightFile.name}</div>}
      </p>

      {state.leftFile && state.rightFile && <XmlComparator leftFile={state.leftFile} rightFile={state.rightFile} config={state.config}/>}
    </div>
  );
}