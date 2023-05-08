import {useTranslation} from 'react-i18next';
import {JSX} from 'react';
import {TLHParser} from 'simtex';
import {ColumnParseResultComponent} from './ColumnParseResultComponent';
import {convertLine} from './LineParseResult';

interface IProps {
  input: string;
  onChange: (value: string) => void;
}

export function TransliterationTextArea({input, onChange}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  const parsed = new TLHParser(input).getLines().map(convertLine);

  return (
    <>
      <div className="mt-2 p-2 rounded border border-slate-500 grid grid-cols-3 gap-2">
        <section>
          <label className="font-bold block text-center">{t('transliteration')}:</label>
          <textarea rows={20} defaultValue={input} placeholder={t('transliteration') || 'transliteration'}
                    onChange={(event) => onChange(event.target.value)}
                    className="mt-2 p-2 rounded border border-slate-500 w-full"/>
        </section>

        <section className="col-span-2">
          <label className="font-bold block text-center">{t('parseResult')}:</label>

          {parsed.length > 0
            ? (
              <div className="mt-2">
                <ColumnParseResultComponent showStatusLevel={true} lines={parsed}/>
              </div>
            )
            : <div className="p-2 italic text-cyan-500 text-center">{t('no_result_yet')}...</div>}
        </section>
      </div>
    </>
  );
}
