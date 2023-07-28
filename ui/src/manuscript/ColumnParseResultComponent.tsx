import {useTranslation} from 'react-i18next';
import {JSX} from 'react';
import {BulmaTabs} from '../genericElements/BulmaTabs';
import {LineParseResultDisplay} from './LineParseResultDisplay';
import {writeNode} from 'simple_xml';
import {tlhXmlEditorConfig} from '../xmlEditor/tlhXmlEditorConfig';
import {LineParseResult} from './LineParseResult';
import {handleSaveToPC} from '../xmlEditor/StandAloneOXTED';

interface IProps {
  showStatusLevel: boolean;
  lines: LineParseResult[];
}

const exportLines = (lines: LineParseResult[]): string[] => lines.map(
  ({nodes}) => nodes.map((node) => writeNode(node, tlhXmlEditorConfig.writeConfig)).join(' ')
);

export function TransliterationParseResultDisplay({lines, showStatusLevel}: IProps): JSX.Element {
  return (
    <div>
      {lines.map((lpr, index) => <LineParseResultDisplay key={index} showStatusLevel={showStatusLevel} line={lpr}/>)}
    </div>
  );
}

export function ColumnParseResultComponent({lines, showStatusLevel}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  const exportedXmlLines = exportLines(lines);

  const onXmlExport = () => handleSaveToPC(exportedXmlLines.join('\n'), 'exported.xml');

  return (
    <BulmaTabs tabs={{
      rendered: {
        name: t('rendered'),
        render: () => <TransliterationParseResultDisplay showStatusLevel={showStatusLevel} lines={lines}/>
      },
      asXml: {
        name: t('xmlView'),
        render: () => (
          <>
            <div className="p-2 rounded border border-slate-300 shadow shadow-slate-200">
              {exportedXmlLines.map((xmlLine, index) => <p key={index}>{xmlLine}</p>)}
            </div>

            <div className="text-center">
              <button type="button" className="my-4 px-4 py-2 rounded bg-blue-500 text-white" onClick={onXmlExport}>{t('exportXml')}</button>
            </div>
          </>
        )
      }
    }}/>
  );
}
