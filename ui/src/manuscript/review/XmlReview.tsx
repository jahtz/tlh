import {JSX} from 'react';
import {useSubmitXmlReviewMutation, useXmlReviewQuery, XmlReviewType} from '../../graphql';
import {Link, Navigate, useParams} from 'react-router-dom';
import {homeUrl} from '../../urls';
import {WithQuery} from '../../WithQuery';
import {MyLeft, parseNewXml, XmlElementNode} from 'simple_xml';
import {XmlDocumentEditor} from '../../xmlEditor/XmlDocumentEditor';
import {useTranslation} from 'react-i18next';
import {writeXml} from '../../xmlEditor/StandAloneOXTED';
import {tlhXmlEditorConfig} from '../../xmlEditor/tlhXmlEditorConfig';

interface IProps {
  mainIdentifier: string;
  initialXml: string;
  reviewType: XmlReviewType;
}

function Inner({mainIdentifier, initialXml, reviewType}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [submitXmlReview, {data, loading/*, error*/}] = useSubmitXmlReviewMutation();

  const rootNodeParseResult = parseNewXml(initialXml, tlhXmlEditorConfig.readConfig);

  if (rootNodeParseResult instanceof MyLeft) {
    throw new Error('TODO!');
  }

  const onExport = (rootNode: XmlElementNode): Promise<void | undefined> =>
    submitXmlReview({variables: {mainIdentifier, review: writeXml(rootNode), reviewType}})
      .then(() => void 0)
      .catch((error) => console.error(error));

  if (data?.reviewerMutations?.submitXmlReview) {
    return (
      <div className="container mx-auto">
        <div className="my-4 p-2 rounded bg-green-500 text-white text-center">
          {reviewType === XmlReviewType.FirstXmlReview ? t('firstXmlReviewPerformed') : t('secondXmlReviewPerformed')}
        </div>

        <Link to={homeUrl} className="p-2 block rounded bg-blue-500 text-white text-center">{t('backToHome')}</Link>
      </div>
    );
  }

  return (
    <XmlDocumentEditor node={rootNodeParseResult.value as XmlElementNode} filename={mainIdentifier} onExport={onExport}
                       exportName={t('submitReview') || 'submitReview'} exportDisabled={loading}/>
  );
}

export function XmlReview({reviewType}: { reviewType: XmlReviewType }): JSX.Element {

  const {mainIdentifier} = useParams<'mainIdentifier'>();

  if (!mainIdentifier) {
    return <Navigate to={homeUrl}/>;
  }

  const query = useXmlReviewQuery({variables: {mainIdentifier, reviewType}});

  return (
    <WithQuery query={query}>
      {(data) =>
        data?.reviewerQueries?.xmlReview
          ? <Inner mainIdentifier={mainIdentifier} initialXml={data.reviewerQueries.xmlReview} reviewType={reviewType}/>
          : <Navigate to={homeUrl}/>}
    </WithQuery>
  );
}