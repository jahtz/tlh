import {useTranslation} from 'react-i18next';
import {BulmaTabs} from '../genericElements/BulmaTabs';
import {LineParseResultDisplay} from './LineParseResultDisplay';
import {writeNode} from 'simple_xml';
import {tlhXmlEditorConfig} from '../xmlEditor/tlhXmlEditorConfig';
import {LineParseResult} from './TransliterationColumnInputDisplay';

interface IProps {
  lines: LineParseResult[];
}

const exportLines = (lines: LineParseResult[]): string[] => lines.map(
  ({nodes}) => nodes.map((node) => writeNode(node, tlhXmlEditorConfig.writeConfig)).join(' ')
);

export function ColumnParseResultComponent({lines}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <BulmaTabs tabs={{
      rendered: {
        name: t('rendered'),
        render: () => (
          <div>
            {lines.map((lpr, index) => <LineParseResultDisplay key={index} line={lpr}/>)}
          </div>
        )
      },
      asXml: {
        name: t('asXml'),
        render: () => (
          <div className="p-2 rounded border border-slate-300 shadow shadow-slate-200">
            {exportLines(lines).map((xmlLine, index) => <p key={index}>{xmlLine}</p>)}
          </div>
        )
      }
    }}/>
  );
}
