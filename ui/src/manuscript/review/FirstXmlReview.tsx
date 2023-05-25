import {JSX} from 'react';
import {useFirstXmlReviewQuery, useSubmitFirstXmlReviewMutation} from '../../graphql';
import {Navigate, useParams} from 'react-router-dom';
import {homeUrl} from '../../urls';
import {WithQuery} from '../../WithQuery';
import {parseNewXml, XmlElementNode, XmlNode} from 'simple_xml';
import {XmlDocumentEditor} from '../../xmlEditor/XmlDocumentEditor';

interface IProps {
  mainIdentifier: string;
  initialXml: string;
}

function Inner({mainIdentifier, initialXml}: IProps): JSX.Element {

  const [submitFirstReview, {data, loading, error}] = useSubmitFirstXmlReviewMutation();

  const rootNodeParseResult = parseNewXml(initialXml);

  if (rootNodeParseResult._type === 'Left') {
    throw new Error('TODO!');
  }

  const download = (rootNode: XmlElementNode): void => {
    console.info('TODO: download...');
  };

  const closeFile = (): void => {
    console.info('TODO: close file...');
  };

  const autoSave = (rootNode: XmlNode): void => {
    console.info('TODO: autoSave!');
  };

  return (
    <XmlDocumentEditor node={rootNodeParseResult.value as XmlElementNode} filename={mainIdentifier} onExport={download} closeFile={closeFile}
                       autoSave={autoSave}/>
  );
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