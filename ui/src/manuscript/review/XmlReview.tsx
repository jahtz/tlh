import {ReactElement, useState} from 'react';
import {useSubmitXmlReviewMutation, useXmlReviewQuery, XmlReviewType} from '../../graphql';
import {Link, Navigate, useParams} from 'react-router-dom';
import {homeUrl} from '../../urls';
import {WithQuery} from '../../WithQuery';
import {MyLeft, parseNewXml, XmlElementNode} from 'simple_xml';
import {XmlDocumentEditor} from '../../xmlEditor/XmlDocumentEditor';
import {useTranslation} from 'react-i18next';
import {writeXml} from '../../xmlEditor/StandAloneOXTED';
import {tlhXmlEditorConfig} from '../../xmlEditor/tlhXmlEditorConfig';
import {XmlRepair} from './XmlRepair';
import {blueButtonClasses} from '../../defaultDesign';
import {makeDownload} from '../../downloadHelper';

interface InnerInnerProps {
  mainIdentifier: string;
  rootNode: XmlElementNode;
  reviewType: XmlReviewType;
}

function InnerInner({mainIdentifier, rootNode, reviewType}: InnerInnerProps): ReactElement {

  const {t} = useTranslation('common');
  const [submitXmlReview, {data, loading}] = useSubmitXmlReviewMutation();

  const onExport = () => makeDownload(writeXml(rootNode), 'exported.xml');

  const onSubmit = async (rootNode: XmlElementNode): Promise<void> => {
    try {
      await submitXmlReview({variables: {mainIdentifier, review: writeXml(rootNode), reviewType}});
    } catch (exception) {
      console.error(exception);
    }
  };

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
      <XmlDocumentEditor node={rootNode} filename={mainIdentifier} onExport={onSubmit} exportName={t('submitReview')} exportDisabled={loading}>
        <div className="text-center">
          <button type="button" className={blueButtonClasses} onClick={onExport}>{t('exportXml')}</button>
        </div>
      </XmlDocumentEditor>
    );
}

interface InnerProps {
  mainIdentifier: string;
  initialXml: string;
  reviewType: XmlReviewType;
}

function Inner({mainIdentifier, initialXml, reviewType}: InnerProps): ReactElement {

  const [rootNodeParseResult, setRootNodeParseResult] = useState(parseNewXml(initialXml, tlhXmlEditorConfig.readConfig));

  return rootNodeParseResult instanceof MyLeft
    ? (
      <div className="container mx-auto">
        <XmlRepair brokenXml={initialXml} onUpdate={(value) => setRootNodeParseResult(parseNewXml(value, tlhXmlEditorConfig.readConfig))}/>
      </div>
    )
    : <InnerInner mainIdentifier={mainIdentifier} rootNode={rootNodeParseResult.value as XmlElementNode} reviewType={reviewType}/>;
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
          ? <Inner mainIdentifier={mainIdentifier} initialXml={manuscript.xmlReviewData} reviewType={reviewType}/>
          : <Navigate to={homeUrl}/>}
    </WithQuery>
  );
}