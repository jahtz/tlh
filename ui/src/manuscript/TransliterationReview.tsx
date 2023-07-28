import {WithQuery} from '../WithQuery';
import {ManuscriptStatus, useReviewTransliterationQuery, useSubmitTransliterationReviewMutation} from '../graphql';
import {Link, Navigate, useParams} from 'react-router-dom';
import {homeUrl} from '../urls';
import {TransliterationTextArea} from './TransliterationTextArea';
import {useTranslation} from 'react-i18next';
import {ReactElement, useState} from 'react';
import {mainButtonClasses} from '../defaultDesign';
import {SuccessMessage} from '../designElements/Messages';

interface IProps {
  mainIdentifier: string;
  initialInput: string;
  initialIsReviewed: boolean;
}

function Inner({mainIdentifier, initialInput, initialIsReviewed}: IProps): ReactElement {

  const {t} = useTranslation('common');
  const [input, setInput] = useState(initialInput);
  const [submitReview, {data, loading, error}] = useSubmitTransliterationReviewMutation();

  const reviewed = initialIsReviewed || !!data?.reviewerMutations?.submitTransliterationReview;

  const onSubmit = () => submitReview({variables: {mainIdentifier, review: input}});

  return (
    <>
      <TransliterationTextArea input={input} onChange={setInput} disabled={reviewed}/>

      {error && <div className="my-2 p-2 rounded bg-red-500 text-white text-center w-full">{error.message}</div>}

      {reviewed
        ? (
          <>
            <SuccessMessage><span>&#10004; {t('transliterationReviewPerformed')}</span></SuccessMessage>

            <div className="text-center">
              <Link to={'../data'} className={mainButtonClasses}>{t('backToManuscript')}</Link>
            </div>
          </>
        ) : (
          <div className="text-center">
            <button type="button" onClick={onSubmit} disabled={loading || reviewed} className={mainButtonClasses}>{t('submit')}</button>
          </div>
        )}
    </>
  );
}

const reviewed = (status: ManuscriptStatus): boolean => status !== ManuscriptStatus.Created && status !== ManuscriptStatus.TransliterationReleased;

export function TransliterationReview(): ReactElement {

  const {t} = useTranslation('common');
  const {mainIdentifier} = useParams<'mainIdentifier'>();

  if (mainIdentifier === undefined) {
    return <Navigate to={homeUrl}/>;
  }

  const reviewQuery = useReviewTransliterationQuery({variables: {mainIdentifier}});

  return (
    <div className="container mx-auto">
      <h2 className="font-bold text-xl text-center">{t('reviewTransliteration')}</h2>

      <WithQuery query={reviewQuery}>
        {({manuscript}) =>
          manuscript?.transliterationReviewData
            ? <Inner mainIdentifier={mainIdentifier} initialInput={manuscript.transliterationReviewData} initialIsReviewed={reviewed(manuscript.status)}/>
            : <Navigate to={homeUrl}/>
        }
      </WithQuery>
    </div>
  );
}