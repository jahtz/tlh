import {useTranslation} from 'react-i18next';
import {ReactElement} from 'react';
import {BulmaTabs} from '../genericElements/BulmaTabs';
import {LineParseResultDisplay} from './LineParseResultDisplay';
import {LineParseResult} from './LineParseResult';
import {makeDownload} from '../downloadHelper';
import {blueButtonClasses} from '../defaultDesign';

interface BaseProps {
  showStatusLevel: boolean;
  lines: LineParseResult[];
}

interface IProps extends BaseProps {
  xmlContent: string;
}

export function TransliterationParseResultDisplay({lines, showStatusLevel}: BaseProps): ReactElement {
  return (
    <div>
      {lines.map((lpr, index) => <LineParseResultDisplay key={index} showStatusLevel={showStatusLevel} line={lpr}/>)}
    </div>
  );
}

export function ParseResultComponent({lines, showStatusLevel, xmlContent}: IProps): ReactElement {

  const {t} = useTranslation('common');

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
              {xmlContent.split('\n').map((xmlLine, index) => <p key={index}>{xmlLine}</p>)}
            </div>

            <div className="text-center">
              <button type="button" className={blueButtonClasses} onClick={() => makeDownload(xmlContent, 'exported.xml')}>{t('exportXml')}</button>
            </div>
          </>
        )
      }
    }}/>
  );
}
