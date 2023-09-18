import {useTranslation} from 'react-i18next';
import {JSX} from 'react';
import {TLHParser} from 'simtex';
import {ParseResultComponent} from './ParseResultComponent';
import {convertLine} from './LineParseResult';
import {XmlCreationValues} from './xmlConversion/createCompleteDocument';
import {exportXmlFromParser} from './exportFromParser';

interface IProps {
  xmlCreationValues: XmlCreationValues;
  initialInput: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export function TransliterationTextArea({xmlCreationValues, initialInput, onChange, disabled}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  const xmlContent = exportXmlFromParser(new TLHParser(initialInput), xmlCreationValues);

  const parsed = new TLHParser(initialInput).getLines().map(convertLine);

  return (
    <div className="mt-2 p-2 grid grid-cols-3 gap-2 rounded border border-slate-500">
      <section>
        <label className="my-2 font-bold block text-center">{t('transliteration')}:</label>

        <textarea rows={20} defaultValue={initialInput} placeholder={t('transliteration') || 'transliteration'} disabled={disabled}
                  className="p-2 rounded border border-slate-500 w-full disabled:opacity-50"
                  onChange={(event) => onChange(event.target.value)}/>
      </section>

      <section className="col-span-2">
        <label className="my-2 font-bold block text-center">{t('parseResult')}:</label>

        {parsed.length > 0
          ? <ParseResultComponent xmlContent={xmlContent} showStatusLevel={true} lines={parsed}/>
          : <div className="p-2 italic text-cyan-500 text-center">{t('no_result_yet')}...</div>}
      </section>
    </div>
  );
}
