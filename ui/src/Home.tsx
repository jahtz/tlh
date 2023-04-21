import {useTranslation} from 'react-i18next';
import {IndexQuery, useIndexLazyQuery} from './graphql';
import {Link} from 'react-router-dom';
import {WithQuery} from './WithQuery';
import {createManuscriptUrl} from './urls';
import {ManuscriptsOverview} from './ManuscriptsOverview';
import {ManuscriptLinkButtons} from './ManuscriptLinkButtons';
import {useState} from 'react';

interface IProps extends IndexQuery {
  page: number;
  queryPage: (page: number) => void;
}

function Inner({manuscriptCount, allManuscripts, myManuscripts, manuscriptsToReview, page, queryPage}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <>
      <div className="my-4 p-2 rounded border border-slate-500">
        <h2 className="font-bold text-center text-xl">{t('newestManuscripts')}</h2>

        <ManuscriptsOverview manuscriptCount={manuscriptCount} allManuscripts={allManuscripts} queryPage={queryPage} page={page}/>
      </div>

      <div className="my-4 p-2 rounded border border-slate-500">
        <h2 className="font-bold text-center text-xl">{t('myManuscripts')}</h2>

        {myManuscripts
          ? <ManuscriptLinkButtons manuscripts={myManuscripts} errorMsg={t('noOwnManuscriptsYet')}/>
          : <p className="italic text-cyan-500 text-center">{t('pleaseLogin')}</p>}
      </div>

      <div className="my-4 p-2 rounded border border-slate-500">
        <h2 className="font-bold text-center text-xl">{t('manuscriptsToReview')}</h2>

        {manuscriptsToReview
          ? <ManuscriptLinkButtons manuscripts={manuscriptsToReview} errorMsg={t('noManuscriptToReviewYet')}/>
          : <p className="italic text-cyan-500 text-center">{t('pleaseLogin')}</p>}
      </div>
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

      {indexQuery.called && <WithQuery query={indexQuery}>
        {(data) => <Inner {...data} page={page} queryPage={queryPage}/>}
      </WithQuery>}

      <Link className="mt-4 p-2 block rounded bg-blue-600 text-white text-center w-full" to={createManuscriptUrl}>
        {t('createManuscript')}
      </Link>
    </div>
  );
}
