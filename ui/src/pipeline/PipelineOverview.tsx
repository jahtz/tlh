import {useTranslation} from 'react-i18next';
import {JSX, useState} from 'react';
import {PipelineOverviewFragment, usePipelineOverviewLazyQuery} from '../graphql';
import {WithQuery} from '../WithQuery';
import {PaginatedTable} from '../PaginatedTable';
import {Navigate} from 'react-router-dom';
import {homeUrl} from '../urls';
import {DocumentInPipelineTableRow} from './DocumentInPipelineTableRow';

interface IProps extends PipelineOverviewFragment {
  page: number;
  queryPage: (page: number) => void;
}

function Inner({page, queryPage, allReviewers, documentsInPipeline}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  const columnNames = [
    t('manuscriptIdentifier'),
    t('appointedTransliterationReviewer'),
    t('appointedXmlConverter'),
    t('appointedFirstXmlReviewer'),
    t('appointedSecondXmlReviewer'),
  ];

  return (
    <PaginatedTable count={-1} data={documentsInPipeline} columnNames={columnNames} emptyMessage={t('noDocumentsInPipelineYet')} page={page}
                    queryPage={queryPage} isFixed={true}>
      {(documentInPipeline) => <DocumentInPipelineTableRow key={documentInPipeline.manuscriptIdentifier} {...documentInPipeline} allReviewers={allReviewers}/>}
    </PaginatedTable>
  );
}

export function PipelineOverview(): JSX.Element {

  const {t} = useTranslation('common');
  const [page, setPage] = useState(0);
  const [executePipelineOverviewQuery, pipelineOverviewQuery] = usePipelineOverviewLazyQuery();

  if (!pipelineOverviewQuery.called) {
    executePipelineOverviewQuery({variables: {page}})
      .catch((error) => console.error(error));
  }

  const queryPage = (page: number): void => {
    executePipelineOverviewQuery({variables: {page}})
      .then(({data}) => {
        if (data) {
          setPage(page);
        }
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className="container mx-auto">
      <h2 className="font-bold text-xl text-center">{t('pipelineOverview')}</h2>

      <WithQuery query={pipelineOverviewQuery}>
        {({executiveEditorQueries}) => executiveEditorQueries
          ? <Inner {...executiveEditorQueries} page={page} queryPage={queryPage}/>
          : <Navigate to={homeUrl}/>}</WithQuery>
    </div>
  );
}