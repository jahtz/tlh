import {useTranslation} from 'react-i18next';
import {BulmaTabs} from '../genericElements/BulmaTabs';
import {LineParseResultDisplay} from './LineParseResultDisplay';
import {LineParseResult, writeLineParseResultToXml} from 'simtex';

interface IProps {
  lineParseResults: LineParseResult[];
}

export function SideParseResultComponent({lineParseResults}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <BulmaTabs tabs={{
      rendered: {
        name: t('rendered'),
        render: () => (
          <div>
            {lineParseResults.map((lpr, index) => <LineParseResultDisplay key={index} lineParseResult={lpr}/>)}
          </div>
        )
      },
      asXml: {
        name: t('asXml'),
        render: () => (
          <div className="p-2 rounded border border-slate-300 shadow shadow-slate-200">
            {lineParseResults.map((l) => writeLineParseResultToXml(l)).map((xmlLine, index) => <p key={index}>{xmlLine}</p>)}
          </div>
        )
      }
    }}/>
  );
}
