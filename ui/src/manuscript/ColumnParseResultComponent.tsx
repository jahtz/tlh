import {useTranslation} from 'react-i18next';
import {BulmaTabs} from '../genericElements/BulmaTabs';
import {LineParseResultDisplay} from './LineParseResultDisplay';
import {Line} from 'simtex';
import {writeNode} from 'simple_xml';
import {tlhXmlEditorConfig} from '../xmlEditor/tlhXmlEditorConfig';

interface IProps {
  lines: Line[];
}

const exportLines = (lines: Line[]): string[] => lines.map(
  (line) => line.exportXml().map((node) => writeNode(node, tlhXmlEditorConfig.writeConfig)).join(' ')
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
