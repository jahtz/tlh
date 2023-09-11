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
import {ErrorMessage, InfoMessage, SuccessMessage} from '../designElements/Messages';
import {blueButtonClasses} from '../defaultDesign';
import {XmlCreationValues} from './xmlConversion/createCompleteDocument';

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

  const {
    mainIdentifier: {identifierType: mainIdentifierType},
    creatorUsername: author,
    creationDate,
    provisionalTransliteration
  } = manuscript;

  const {t} = useTranslation('common');
  const [{input, isSaved, isReleased}, setTransliteration] = useState<IState>({
    input: provisionalTransliteration || '',
    isSaved: true,
    isReleased: initialIsReleased
  });
  const [uploadTransliteration, {loading: uploadLoading, error: uploadError}] = useUploadTransliterationMutation();
  const [releaseTransliteration, {loading: releaseLoading, error: releaseError}] = useReleaseTransliterationMutation();

  const updateTransliteration = (value: string): void => setTransliteration((state) => update(state, {input: {$set: value}, isSaved: {$set: false}}));

  const upload = async () => {
    const res = await uploadTransliteration({variables: {mainIdentifier, input}});

    if (res.data?.manuscript?.updateTransliteration) {
      setTransliteration((state) => update(state, {isSaved: {$set: true}}));
    }
  };

  const onReleaseTransliteration = async () => {
    if (!confirm(t('onReleaseAlert'))) {
      return;
    }

    const {data} = await releaseTransliteration({variables: {mainIdentifier}});

    if (data?.manuscript?.releaseTransliteration) {
      setTransliteration((state) => update(state, {isReleased: {$set: true}}));
    }
  };

  const xmlCreationValues: XmlCreationValues = {mainIdentifierType, mainIdentifier, author, creationDate, transliterationReleaseDate: undefined};

  return (
    <>
      <TransliterationTextArea xmlCreationValues={xmlCreationValues} input={input} onChange={updateTransliteration} disabled={isReleased}/>

      {uploadError && <ErrorMessage>{uploadError.message}</ErrorMessage>}
      {releaseError && <ErrorMessage>{releaseError.message}</ErrorMessage>}

      {isReleased
        ? (
          <div className="text-center">
            <SuccessMessage><span>&#10004; {t('transliterationReleased')}</span></SuccessMessage>

            <Link to={'../data'} className="my-4 px-4 py-2 rounded bg-blue-500 text-white">{t('backToManuscript')}</Link>
          </div>
        ) : (
          isSaved
            ? <SuccessMessage><span>&#10004; {t('currentVersionSaved')}</span></SuccessMessage>
            : <InfoMessage><span>&#x26A0; {t('changesMade')}</span></InfoMessage>
        )}

      <div className="my-4 p-4 text-center">
        <button type="button" className={blueButtonClasses} onClick={upload} disabled={uploadLoading || isSaved || isReleased}>
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
