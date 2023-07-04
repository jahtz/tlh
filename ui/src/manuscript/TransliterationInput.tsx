import {ReactElement, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {User} from '../newStore';
import {homeUrl} from '../urls';
import {TransliterationInputDataFragment, useTransliterationInputQuery, useUploadTransliterationMutation} from '../graphql';
import {Navigate, useParams} from 'react-router-dom';
import update from 'immutability-helper';
import {TransliterationTextArea} from './TransliterationTextArea';
import {WithQuery} from '../WithQuery';

interface IProps {
  currentUser: User;
}

interface InnerProps {
  mainIdentifier: string;
  manuscript: TransliterationInputDataFragment;
}

interface IState {
  input: string;
  isSaved: boolean;
}

function TransliterationInput({mainIdentifier, manuscript}: InnerProps): ReactElement {

  const {t} = useTranslation('common');
  const [transliteration, setTransliteration] = useState<IState>({input: manuscript.provisionalTransliteration || '', isSaved: true});
  const [uploadTransliteration, {loading, error}] = useUploadTransliterationMutation();

  const updateTransliteration = (value: string): void => setTransliteration((state) => update(state, {input: {$set: value}, isSaved: {$set: false}}));

  const upload = (): Promise<void> => uploadTransliteration({variables: {mainIdentifier, input: transliteration.input}})
    .then((res) => {
      if (res.data?.me?.manuscript?.updateTransliteration) {
        setTransliteration((state) => update(state, {isSaved: {$set: true}}));
      }
    })
    .catch((error) => console.error('Could not upload transliteration:\n' + error));

  return (
    <>
      <TransliterationTextArea input={transliteration.input} onChange={updateTransliteration}/>

      {transliteration.isSaved && <div className="my-4 p-2 rounded bg-green-500 text-white text-center">&#10004; {t('currentVersionSaved')}</div>}

      {error && <div className="my-2 p-2 bg-red-500 text-white text-center">{error.message}</div>}

      <button type="button" className="my-4 p-2 rounded bg-blue-500 text-white w-full" onClick={upload} disabled={loading}>
        {t('uploadTransliteration')}
      </button>
    </>
  );
}

export function TransliterationInputContainer({currentUser}: IProps): ReactElement {

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

          if (manuscript === undefined || manuscript === null) {
            return <div className="p-2 italic text-cyan-500 text-center w-full">{t('manuscriptNotFound')}</div>;
          }

          if (manuscript.creatorUsername !== currentUser.sub) {
            return <div className="p-2 italic text-cyan-500 text-center w-full">{t('cannotEditForeignTransliteration')}</div>;
          }

          return <TransliterationInput mainIdentifier={mainIdentifier} manuscript={manuscript}/>;
        }}
      </WithQuery>
    </div>
  );
}
