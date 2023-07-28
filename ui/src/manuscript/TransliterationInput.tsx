import {ReactElement, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {User} from '../newStore';
import {homeUrl} from '../urls';
import {
  ManuscriptStatus,
  TransliterationInputDataFragment,
  useReleaseTransliterationMutation,
  useTransliterationInputQuery,
  useUploadTransliterationMutation
} from '../graphql';
import {Link, Navigate, useParams} from 'react-router-dom';
import update from 'immutability-helper';
import {TransliterationTextArea} from './TransliterationTextArea';
import {WithQuery} from '../WithQuery';

interface InnerProps {
  mainIdentifier: string;
  manuscript: TransliterationInputDataFragment;
  initialIsReleased: boolean;
}

interface IState {
  input: string;
  isSaved: boolean;
  isReleased: boolean;
}

const buttonClasses = (mainColor: string) => `px-4 py-2 rounded bg-${mainColor}-500 text-white drop-shadow-xl disabled:opacity-50`;

function TransliterationInput({mainIdentifier, manuscript, initialIsReleased}: InnerProps): ReactElement {

  const {t} = useTranslation('common');
  const [{input, isSaved, isReleased}, setTransliteration] = useState<IState>({
    input: manuscript.provisionalTransliteration || '',
    isSaved: true,
    isReleased: initialIsReleased
  });
  const [uploadTransliteration, {loading: uploadLoading, error: uploadError}] = useUploadTransliterationMutation();
  const [releaseTransliteration, {loading: releaseLoading, error: releaseError}] = useReleaseTransliterationMutation();

  const updateTransliteration = (value: string): void => setTransliteration((state) => update(state, {input: {$set: value}, isSaved: {$set: false}}));

  const upload = async () => {
    const res = await uploadTransliteration({variables: {mainIdentifier, input}});

    if (res.data?.me?.manuscript?.updateTransliteration) {
      setTransliteration((state) => update(state, {isSaved: {$set: true}}));
    }
  };

  const onReleaseTransliteration = async () => {
    if (!confirm(t('onReleaseAlert'))) {
      return;
    }

    const res = await releaseTransliteration({variables: {mainIdentifier}});

    if (res.data?.me?.manuscript?.releaseTransliteration) {
      setTransliteration((state) => update(state, {isReleased: {$set: true}}));
    }
  };

  return (
    <>
      <TransliterationTextArea input={input} onChange={updateTransliteration} disabled={isReleased}/>

      {uploadError && <div className="my-2 p-4 bg-red-500 text-white text-center">{uploadError.message}</div>}
      {releaseError && <div className="my-2 p-4 bgred-500 text-white text-center">{releaseError.message}</div>}

      {isReleased
        ? (
          <div className="text-center">
            <div className="my-4 p-4 rounded bg-amber-500 text-white text-center">&#10004; {t('transliterationReleased')}</div>

            <Link to={'../data'} className="my-4 px-4 py-2 rounded bg-blue-500 text-white">{t('backToManuscript')}</Link>
          </div>
        ) : (
          isSaved
            ? <div className="my-4 p-4 rounded bg-green-500 text-white text-center">&#10004; {t('currentVersionSaved')}</div>
            : <div className="my-4 p-4 rounded bg-cyan-500 text-white text-center">&#x26A0; {t('changesMade')}</div>
        )}

      <div className="my-4 p-4 text-center">
        <button type="button" className={buttonClasses('blue')} onClick={upload} disabled={uploadLoading || isSaved || isReleased}>
          {t('uploadTransliteration')}
        </button>
      </div>

      <div className="my-4 p-4 text-center">
        <button type="button" className={buttonClasses('amber')} onClick={onReleaseTransliteration}
                disabled={uploadLoading || releaseLoading || !isSaved || isReleased}>
          {t('releaseTransliteration')}
        </button>
      </div>
    </>
  );
}

export function TransliterationInputContainer({currentUser}: { currentUser: User }): ReactElement {

  const {mainIdentifier} = useParams<'mainIdentifier'>();

  if (mainIdentifier === undefined) {
    return <Navigate to={homeUrl}/>;
  }

  const {t} = useTranslation('common');

  const query = useTransliterationInputQuery({variables: {mainIdentifier}});

  return (
    <div className="container mx-auto">
      <h1 className="my-4 font-bold text-xl text-center">{decodeURIComponent(mainIdentifier)}: {t('createTransliteration')}</h1>

      <WithQuery query={query}>
        {({manuscript}) => {

          if (!manuscript) {
            return <div className="p-2 italic text-cyan-500 text-center w-full">{t('manuscriptNotFound')}</div>;
          }

          if (manuscript.creatorUsername !== currentUser.sub) {
            return <div className="p-2 italic text-cyan-500 text-center w-full">{t('cannotEditForeignTransliteration')}</div>;
          }

          const isReleased = manuscript.status !== ManuscriptStatus.Created;

          return <TransliterationInput mainIdentifier={mainIdentifier} manuscript={manuscript} initialIsReleased={isReleased}/>;
        }}
      </WithQuery>
    </div>
  );
}
