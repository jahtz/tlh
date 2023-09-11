import {useTranslation} from 'react-i18next';
import {JSX} from 'react';
import {BulmaTabs} from '../genericElements/BulmaTabs';
import {LineParseResultDisplay} from './LineParseResultDisplay';
import {LineParseResult} from './LineParseResult';
import {makeDownload} from '../downloadHelper';
import {createCompleteDocument, XmlCreationValues} from './xmlConversion/createCompleteDocument';
import {writeXml} from '../xmlEditor/StandAloneOXTED';

interface IProps {
  xmlCreationValues: XmlCreationValues;
  showStatusLevel: boolean;
  lines: LineParseResult[];
}

const exportLines = (lines: LineParseResult[], xmlCreationValues: XmlCreationValues): string[] => {
  const nodes = lines.map(({nodes}) => nodes).flat();

  const converted = createCompleteDocument(nodes, xmlCreationValues);

  return writeXml(converted).split('\n');

//  return lines.map(({nodes}) => nodes.map((node) => writeNode(node, tlhXmlEditorConfig.writeConfig)).join(' '));
};

export function TransliterationParseResultDisplay({lines, showStatusLevel}: IProps): JSX.Element {
  return (
    <div>
      {lines.map((lpr, index) => <LineParseResultDisplay key={index} showStatusLevel={showStatusLevel} line={lpr}/>)}
    </div>
  );
}

export function ColumnParseResultComponent({xmlCreationValues, lines, showStatusLevel}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  const exportedXmlLines = exportLines(lines, xmlCreationValues);

  const onXmlExport = () => makeDownload(exportedXmlLines.join('\n'), 'exported.xml');

  return (
    <BulmaTabs tabs={{
      rendered: {
        name: t('rendered'),
        render: () => <TransliterationParseResultDisplay xmlCreationValues={xmlCreationValues} showStatusLevel={showStatusLevel} lines={lines}/>
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
