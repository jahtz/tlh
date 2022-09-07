import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ManuscriptBasicDataFragment, useIndexLazyQuery} from './graphql';
import {Link} from 'react-router-dom';
import {WithQuery} from './WithQuery';
import {createManuscriptUrl} from './urls';
import {MyPagination} from './genericElements/pagination';

const initialPage = 0;
const paginationSize = 10;

interface IProps {
  manuscriptCount: number;
  allManuscripts: ManuscriptBasicDataFragment[];
  queryPage: (page: number) => void;
}

function Inner({manuscriptCount, allManuscripts, queryPage}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [page, setPage] = useState(initialPage);

  if (allManuscripts.length === 0) {
    return <div className="my-2 p-2 rounded bg-cyan-500 text-white text-center">{t('noManuscriptsYet')}</div>;
  }

  function previousPage(): void {
    page > 0 && goToPage(page - 1);
  }

  function nextPage(): void {
    goToPage(page + 1);
  }

  function goToPage(pageNumber: number): void {
    setPage(pageNumber);
    queryPage(pageNumber);
  }

  const pageCount = Math.ceil(manuscriptCount / paginationSize);

  return (
    <>
      <table className="table-auto w-full border-collapse">
        <thead>
          <tr className="text-left border-b-2 border-slate-500">
            <th className="p-2">{t('mainIdentifier')}</th>
            <th className="p-2">{t('status')}</th>
            <th className="p-2">{t('creator')}</th>
          </tr>
        </thead>
        <tbody>
          {allManuscripts.map(({mainIdentifier: {identifier, identifierType}, status, creatorUsername}) =>
            <tr key={identifier} className="border-t border-slate-600">
              <td className="p-2">
                <Link to={`manuscripts/${encodeURIComponent(identifier)}/data`}>
                  {identifier} ({identifierType})
                </Link>
              </td>
              <td className="p-2">{status}</td>
              <td className="p-2">{creatorUsername}</td>
            </tr>
          )}
        </tbody>
      </table>

      <MyPagination currentPage={page} pageCount={pageCount} previousPage={previousPage} goToPage={goToPage} nextPage={nextPage}/>
    </>
  );
}

export function Home(): JSX.Element {

  const {t} = useTranslation('common');
  const [getIndexQuery, indexQuery] = useIndexLazyQuery();

  function queryPage(page: number) {
    getIndexQuery({variables: {page, paginationSize}})
      .catch((error) => console.error(error));
  }

  if (!indexQuery.called) {
    queryPage(initialPage);
  }

  return (
    <div className="container mx-auto">
      <h1 className="font-bold text-2xl text-center mb-4">{t('manuskript_plural')}</h1>

      {indexQuery.called && <WithQuery query={indexQuery}>
        {({manuscriptCount, allManuscripts}) => <Inner manuscriptCount={manuscriptCount} allManuscripts={allManuscripts} queryPage={queryPage}/>}
      </WithQuery>}

      <Link className="mt-4 p-2 block rounded bg-blue-600 text-white text-center w-full" to={createManuscriptUrl}>
        {t('createManuscript')}
      </Link>
    </div>
  );
}
