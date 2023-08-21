import {JSX} from 'react';
import {Link, Navigate, useParams} from 'react-router-dom';
import {homeUrl} from '../urls';
import {useApprovalQuery, useSubmitApprovalMutation} from '../graphql';
import {WithQuery} from '../WithQuery';
import {useTranslation} from 'react-i18next';
import {XmlDocumentEditor} from '../xmlEditor/XmlDocumentEditor';
import {MyLeft, parseNewXml, XmlElementNode} from 'simple_xml';
import {writeXml} from '../xmlEditor/StandAloneOXTED';
import {tlhXmlEditorConfig} from '../xmlEditor/tlhXmlEditorConfig';

interface IProps {
  mainIdentifier: string;
  initialXml: string;
}

function Inner({mainIdentifier, initialXml}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [submitApproval, {data, loading/*, error*/}] = useSubmitApprovalMutation();

  const rootNodeParseResult = parseNewXml(initialXml, tlhXmlEditorConfig.readConfig);

  if (rootNodeParseResult instanceof MyLeft) {
    throw new Error('TODO!');
  }

  const onExport = async (rootNode: XmlElementNode): Promise<void | undefined> => {
    try {
      await submitApproval({variables: {mainIdentifier, input: writeXml(rootNode)}});
    } catch (error) {
      console.error(error);
    }
  };

  if (data?.executiveEditor?.submitApproval) {
    return (
      <div className="container mx-auto">
        <div className="my-4 p-2 rounded bg-green-500 text-white text-center">{t('documentApproved')}</div>

        <Link to={homeUrl} className="p-2 block rounded bg-blue-500 text-white text-center">{t('backToHome')}</Link>
      </div>
    );
  }

  return (
    <XmlDocumentEditor node={rootNodeParseResult.value as XmlElementNode} filename={mainIdentifier} onExportXml={onExport} exportDisabled={loading}/>
  );
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