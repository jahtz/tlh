import {WithQuery} from '../WithQuery';
import {useReviewTransliterationQuery, useSubmitTransliterationReviewMutation} from '../graphql';
import {Navigate, useParams} from 'react-router-dom';
import {homeUrl} from '../urls';
import {TransliterationTextArea} from './TransliterationTextArea';
import {useTranslation} from 'react-i18next';
import {JSX, useState} from 'react';
import { Link } from 'react-router-dom';

interface IProps {
  mainIdentifier: string;
  initialInput: string;
}

function Inner({mainIdentifier, initialInput}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [input, setInput] = useState(initialInput);
  const [submitReview, {data, loading, error}] = useSubmitTransliterationReviewMutation();

  const onSubmit = (): Promise<void | undefined> =>
    submitReview({variables: {mainIdentifier, review: input}})
      .then(() => void 0)
      .catch((error) => console.error(error));

  return (
    <div className="container mx-auto">
      <h2 className="font-bold text-xl text-center">{t('reviewTransliteration')}</h2>

      {data?.reviewerMutations?.submitTransliterationReview
        ? (
          <>
            <div className="my-4 p-2 rounded bg-green-500 text-white text-center">{t('transliterationReviewPerformed')}</div>

            <Link to={homeUrl} className="p-2 block rounded bg-blue-500 text-white text-center">{t('backToHome')}</Link>
          </>
        ) : (
          <>
            <TransliterationTextArea input={input} onChange={setInput}/>

            <button type="button" onClick={onSubmit} disabled={loading} className="my-2 p-2 rounded bg-blue-500 text-white w-full disabled:opacity-50">
              {t('submit')}
            </button>
          </>
        )}

      {error && <div className="my-2 p-2 rounded bg-red-500 text-white text-center w-full">{error.message}</div>}
    </div>
  );
}

export function TransliterationReview(): JSX.Element {

  const mainIdentifier = useParams<'mainIdentifier'>().mainIdentifier;

  if (mainIdentifier === undefined) {
    return <Navigate to={homeUrl}/>;
  }

  const reviewQuery = useReviewTransliterationQuery({variables: {mainIdentifier}});

  return (
    <WithQuery query={reviewQuery}>
      {(data) =>
        data.reviewerQueries?.transliterationReview
          ? <Inner mainIdentifier={mainIdentifier} initialInput={data.reviewerQueries.transliterationReview}/>
          : <Navigate to={homeUrl}/>
      }
    </WithQuery>
  );
}