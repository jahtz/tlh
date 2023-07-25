import {useTranslation} from 'react-i18next';
import {JSX, useState} from 'react';
import {IndexQuery, useIndexLazyQuery} from './graphql';
import {Link} from 'react-router-dom';
import {WithQuery} from './WithQuery';
import {createManuscriptUrl} from './urls';
import {ManuscriptsOverview} from './ManuscriptsOverview';
import {ManuscriptLinkButtons} from './ManuscriptLinkButtons';
import {Box} from './Box';
import {ReviewerHomeBox} from './ReviewerHomeBox';
import {ExecutiveEditorHomeBox} from './ExecutiveEditorHomeBox';

interface IProps extends IndexQuery {
  page: number;
  queryPage: (page: number) => void;
}

function Inner({manuscriptCount, allManuscripts, myManuscripts, page, queryPage, reviewerQueries, executiveEditorQueries}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <>
      {myManuscripts && <Box heading={t('myManuscripts')}>
        <ManuscriptLinkButtons manuscripts={myManuscripts} errorMsg={t('noOwnManuscriptsYet')}/>
      </Box>}

      {reviewerQueries && <ReviewerHomeBox {...reviewerQueries}/>}

      {executiveEditorQueries && <ExecutiveEditorHomeBox {...executiveEditorQueries}/>}

      <Box heading={t('newestManuscripts')}>
        <ManuscriptsOverview manuscriptCount={manuscriptCount} allManuscripts={allManuscripts} queryPage={queryPage} page={page}/>
      </Box>
    </>
  );
}

export function Home(): JSX.Element {

  const {t} = useTranslation('common');
  const [executeIndexQuery, indexQuery] = useIndexLazyQuery();
  const [page, setPage] = useState(0);

  function queryPage(page: number) {
    executeIndexQuery({variables: {page}})
      .then((res) => {
        if (res.data) {
          setPage(page);
        }
      })
      .catch((error) => console.error(error));
  }

  if (!indexQuery.called) {
    queryPage(page);
  }

  return (
    <div className="container mx-auto">
      <h1 className="font-bold text-2xl text-center mb-4">TLH<sup>dig</sup></h1>

      <div className="my-8 text-center">
        <Link className="px-8 py-2 rounded bg-blue-600 text-white text-center" to={createManuscriptUrl}>
          {t('createManuscript')}
        </Link>
      </div>

      {indexQuery.called && <WithQuery query={indexQuery}>
        {(data) => <Inner {...data} page={page} queryPage={queryPage}/>}
      </WithQuery>}

    </div>
  );
}
