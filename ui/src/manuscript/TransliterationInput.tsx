import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {activeUserSelector} from '../newStore';
import {homeUrl} from '../urls';
import {ManuscriptMetaDataFragment, useUploadTransliterationMutation} from '../graphql';
import {Navigate, useLoaderData} from 'react-router-dom';
import {TLHParser} from 'simtex';
import {ColumnParseResultComponent} from './ColumnParseResultComponent';
import {convertLine} from './LineParseResult';

export function TransliterationInput(): JSX.Element {

  const manuscript = useLoaderData() as ManuscriptMetaDataFragment | undefined;

  if(!manuscript) {
    return <Navigate to={homeUrl}/>;
  }

  const {t} = useTranslation('common');
  const [transliteration, setTransliteration] = useState(manuscript.provisionalTransliteration || '');
  const currentUser = useSelector(activeUserSelector);

  const [uploadTransliteration, {/*data,*/ loading, error}] = useUploadTransliterationMutation();

  if (!manuscript || !currentUser || currentUser.user_id !== manuscript.creatorUsername) {
    return <Navigate to={homeUrl}/>;
  }

  const mainIdentifier = manuscript.mainIdentifier.identifier;

  function upload(): void {
    uploadTransliteration({variables: {mainIdentifier, input: transliteration}})
      .catch((error) => console.error('Could not upload transliteration:\n' + error));
  }

  const parsed = new TLHParser(transliteration).getLines().map(convertLine);

  return (
    <div className="container mx-auto">
      <h1 className="my-4 font-bold text-xl text-center">{t('createTransliteration')}</h1>

      <div className="mt-2 p-2 rounded border border-slate-500 grid grid-cols-3 gap-2">
        <section>
          <label className="font-bold block text-center">{t('transliteration')}:</label>
          <textarea rows={20} defaultValue={transliteration} placeholder={t('transliteration') || 'transliteration'}
                    onChange={(event) => setTransliteration(event.target.value)}
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

      {error && <div className="mt-2 p-2 bg-red-500 text-white text-center">{error.message}</div>}

      <button type="button" className="p-2 rounded bg-blue-500 text-white w-full" onClick={upload} disabled={loading}>{t('uploadTransliteration')}</button>
    </div>
  );
}
