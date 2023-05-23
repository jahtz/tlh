import {useTranslation} from 'react-i18next';
import {JSX} from 'react';
import {TLHParser} from 'simtex';
import {ColumnParseResultComponent} from './ColumnParseResultComponent';
import {convertLine} from './LineParseResult';

interface IProps {
  input: string;
  onChange: (value: string) => void;
}

const textAreaClasses = 'mt-2 p-2 rounded border border-slate-500 w-full';

export function TransliterationTextArea({input, onChange}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  const parsed = new TLHParser(input).getLines().map(convertLine);

  return (
    <div className="mt-2 p-2 grid grid-cols-3 gap-2 rounded border border-slate-500">
      <section>
        <label className="my-2 font-bold block text-center">{t('transliteration')}:</label>

        <textarea rows={20} defaultValue={input} placeholder={t('transliteration') || 'transliteration'} className={textAreaClasses}
                  onChange={(event) => onChange(event.target.value)}/>
      </section>

      <section className="col-span-2">
        <label className="my-2 font-bold block text-center">{t('parseResult')}:</label>

        {parsed.length > 0
          ? <ColumnParseResultComponent showStatusLevel={true} lines={parsed}/>
          : <div className="p-2 italic text-cyan-500 text-center">{t('no_result_yet')}...</div>}
      </section>
    </div>
  );
}
