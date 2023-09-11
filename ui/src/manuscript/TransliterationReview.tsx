import {WithQuery} from '../WithQuery';
import {ManuscriptStatus, TransliterationReviewDataFragment, useReviewTransliterationQuery, useSubmitTransliterationReviewMutation} from '../graphql';
import {Link, Navigate, useParams} from 'react-router-dom';
import {homeUrl} from '../urls';
import {TransliterationTextArea} from './TransliterationTextArea';
import {useTranslation} from 'react-i18next';
import {ReactElement, useState} from 'react';
import {blueButtonClasses} from '../defaultDesign';
import {SuccessMessage} from '../designElements/Messages';
import {XmlCreationValues} from './xmlConversion/createCompleteDocument';

interface IProps {
  mainIdentifier: string;
  manuscript: TransliterationReviewDataFragment;
}

function Inner({mainIdentifier, manuscript}: IProps): ReactElement {

  const {mainIdentifier: {mainIdentifierType}, initialInput, transliterationReleaseDate, creationDate, author} = manuscript;

  const {t} = useTranslation('common');
  const [input, setInput] = useState(initialInput || '');
  const [submitReview, {data, loading, error}] = useSubmitTransliterationReviewMutation();

  const reviewed = !!data?.reviewerMutations?.submitTransliterationReview;

  const onSubmit = () => submitReview({variables: {mainIdentifier, review: input}});

  const xmlCreationValues: XmlCreationValues = {creationDate, author, transliterationReleaseDate, mainIdentifierType, mainIdentifier};

  return (
    <>
      <TransliterationTextArea input={input} xmlCreationValues={xmlCreationValues} onChange={setInput} disabled={reviewed}/>

      {error && <div className="my-2 p-2 rounded bg-red-500 text-white text-center w-full">{error.message}</div>}

      {reviewed
        ? (
          <>
            <SuccessMessage><span>&#10004; {t('transliterationReviewPerformed')}</span></SuccessMessage>

            <div className="text-center">
              <Link to={homeUrl} className={blueButtonClasses}>{t('backToHome')}</Link>
            </div>
          </>
        ) : (
          <div className="text-center">
            <button type="button" onClick={onSubmit} disabled={loading || reviewed} className={blueButtonClasses}>{t('submit')}</button>
          </div>
        )}
    </>
  );
}

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
          manuscript && manuscript.initialInput && manuscript.status === ManuscriptStatus.TransliterationReleased
            ? <Inner mainIdentifier={mainIdentifier} manuscript={manuscript}/>
            : <Navigate to={homeUrl}/>
        }
      </WithQuery>
    </div>
  );
}