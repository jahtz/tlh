import {JSX} from 'react';
import {useFirstXmlReviewQuery} from '../../graphql';
import {Navigate, useParams} from 'react-router-dom';
import {homeUrl} from '../../urls';
import {WithQuery} from '../../WithQuery';

interface IProps {
  mainIdentifier: string;
  initialXml: string;
}

function Inner({mainIdentifier, initialXml}: IProps): JSX.Element {
  return <pre>{initialXml}</pre>;
}

export function FirstXmlReview(): JSX.Element {

  const mainIdentifier = useParams<'mainIdentifier'>().mainIdentifier;

  if (!mainIdentifier) {
    return <Navigate to={homeUrl}/>;
  }

  const query = useFirstXmlReviewQuery({variables: {mainIdentifier}});

  return (
    <WithQuery query={query}>
      {(data) =>
        data?.reviewerQueries?.firstXmlReview
          ? <Inner mainIdentifier={mainIdentifier} initialXml={data.reviewerQueries.firstXmlReview}/>
          : <Navigate to={homeUrl}/>}
    </WithQuery>
  );
}