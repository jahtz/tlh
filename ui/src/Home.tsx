import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useIndexLazyQuery} from './graphql';
import {Link} from 'react-router-dom';
import {WithQuery} from './WithQuery';
import {createManuscriptUrl} from './urls';
import {MyPagination} from './bulmaHelpers/BulmaPagination';

const paginationSize = 10;

export function Home(): JSX.Element {

  const {t} = useTranslation('common');
  const [getIndexQuery, indexQuery] = useIndexLazyQuery();
  const [page, setPage] = useState(0);

  if (!indexQuery.called) {
    getIndexQuery({variables: {page, paginationSize}});
  }

  function previousPage(): void {
    if (page > 0) {
      goToPage(page - 1);
    }
  }

  function nextPage(): void {
    goToPage(page + 1);
  }

  function goToPage(pageNumber: number): void {
    setPage(pageNumber);
    getIndexQuery({variables: {page: pageNumber, paginationSize}});
  }

  return (
    <div className="container mx-auto">
      <h1 className="font-bold text-2xl text-center mb-4">{t('manuskript_plural')}</h1>

      {indexQuery.called && <WithQuery query={indexQuery}>
        {({manuscriptCount, allManuscripts}) => {
          if (allManuscripts.length === 0) {
            return <div className="notification is-primary has-text-centered">{t('noManuscriptsYet')}</div>;
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
        }}
      </WithQuery>}

      <Link className="mt-4 rounded bg-blue-600 text-white w-full p-2" to={createManuscriptUrl}>
        {t('createManuscript')}
      </Link>
    </div>
  );
}
