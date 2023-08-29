import {ReactElement} from 'react';
import {useSubmitXmlReviewMutation, useXmlReviewQuery, XmlReviewType} from '../../graphql';
import {Link, Navigate, useParams} from 'react-router-dom';
import {homeUrl} from '../../urls';
import {WithQuery} from '../../WithQuery';
import {XmlElementNode} from 'simple_xml';
import {XmlDocumentEditor} from '../../xmlEditor/XmlDocumentEditor';
import {useTranslation} from 'react-i18next';
import {writeXml} from '../../xmlEditor/StandAloneOXTED';
import {makeDownload} from '../../downloadHelper';
import {XmlValidityChecker} from '../../xmlEditor/XmlValidityChecker';

interface InnerInnerProps {
  mainIdentifier: string;
  rootNode: XmlElementNode;
  reviewType: XmlReviewType;
}

function InnerInner({mainIdentifier, rootNode, reviewType}: InnerInnerProps): ReactElement {

  const {t} = useTranslation('common');
  const [submitXmlReview, {data, loading}] = useSubmitXmlReviewMutation();

  const onSubmit = async (rootNode: XmlElementNode): Promise<void> => {
    try {
      await submitXmlReview({variables: {mainIdentifier, review: writeXml(rootNode), reviewType}});
    } catch (exception) {
      console.error(exception);
    }
  };

  const onExportXml = (rootNode: XmlElementNode) => makeDownload(writeXml(rootNode), 'exported.xml');

  return data?.reviewerMutations?.submitXmlReview
    ? (
      <div className="container mx-auto">
        <div className="my-4 p-2 rounded bg-green-500 text-white text-center">
          {reviewType === XmlReviewType.FirstXmlReview ? t('firstXmlReviewPerformed') : t('secondXmlReviewPerformed')}
        </div>

        <Link to={homeUrl} className="p-2 block rounded bg-blue-500 text-white text-center">{t('backToHome')}</Link>
      </div>
    )
    : (
      <XmlDocumentEditor node={rootNode} filename={mainIdentifier} onExportXml={onExportXml} exportDisabled={loading}
                         otherButtonConfig={{title: t('submitReview'), color: 'green', onClick: onSubmit}}/>
    );
}

export function XmlReview({reviewType}: { reviewType: XmlReviewType }): ReactElement {

  const {mainIdentifier} = useParams<'mainIdentifier'>();

  if (!mainIdentifier) {
    return <Navigate to={homeUrl}/>;
  }

  const query = useXmlReviewQuery({variables: {mainIdentifier, reviewType}});

  return (
    <WithQuery query={query}>
      {({manuscript}) =>
        manuscript?.xmlReviewData
          ? (
            <XmlValidityChecker xmlSource={manuscript.xmlReviewData}>
              {(rootNode) => <InnerInner mainIdentifier={mainIdentifier} rootNode={rootNode} reviewType={reviewType}/>}
            </XmlValidityChecker>
          ) : <Navigate to={homeUrl}/>}
    </WithQuery>
  );
}