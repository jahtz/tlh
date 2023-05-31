import {JSX} from 'react';
import {Navigate, useParams} from 'react-router-dom';
import {homeUrl} from '../urls';
import {useApprovalQuery, useSubmitApprovalMutation} from '../graphql';
import {WithQuery} from '../WithQuery';
import {useTranslation} from 'react-i18next';
import {XmlDocumentEditor} from '../xmlEditor/XmlDocumentEditor';
import {MyLeft, parseNewXml, XmlElementNode} from 'simple_xml';
import {writeXml} from '../xmlEditor/StandAloneOXTED';

interface IProps {
  mainIdentifier: string;
  initialXml: string;
}

function Inner({mainIdentifier, initialXml}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [submitApproval, {data, loading/*, error*/}] = useSubmitApprovalMutation();

  const rootNodeParseResult = parseNewXml(initialXml);

  if (rootNodeParseResult instanceof MyLeft) {
    throw new Error('TODO!');
  }

  const onExport = (rootNode: XmlElementNode): Promise<void | undefined> =>
    submitApproval({variables: {mainIdentifier, input: writeXml(rootNode)}})
      .then(() => void 0)
      .catch((error) => console.error(error));

  return data?.executiveEditor?.submitApproval
    ? <div>TODO!</div>
    : <XmlDocumentEditor node={rootNodeParseResult.value as XmlElementNode} filename={mainIdentifier} onExport={onExport}
                         exportName={t('submitApproval') || 'submitApproval'} exportDisabled={loading}/>;
}

export function DocumentApproval(): JSX.Element {

  const {mainIdentifier} = useParams<'mainIdentifier'>();

  if (mainIdentifier === undefined) {
    return <Navigate to={homeUrl}/>;
  }

  const query = useApprovalQuery({variables: {mainIdentifier}});

  return (
    <WithQuery query={query}>
      {(data) => data?.executiveEditorQueries?.documentAwaitingApproval
        ? <Inner mainIdentifier={mainIdentifier} initialXml={data.executiveEditorQueries.documentAwaitingApproval}/>
        : <Navigate to={homeUrl}/>}
    </WithQuery>
  );
}