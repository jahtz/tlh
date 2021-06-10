import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {IndexQuery, useIndexLazyQuery} from './generated/graphql';
import {Link} from 'react-router-dom';
import {WithQuery} from './WithQuery';
import {createManuscriptUrl} from './urls';
import {Pagination} from './Pagination';

export function Home(): JSX.Element {

  const {t} = useTranslation('common');
  const [getIndexQuery, indexQuery] = useIndexLazyQuery();

  const [page, setPage] = useState(0);
  const [paginationSize/*, setPaginationSize*/] = useState(10);

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

  function render({manuscriptCount, allManuscripts}: IndexQuery): JSX.Element {
    if (allManuscripts.length === 0) {
      return <div className="notification is-primary has-text-centered">{t('noManuscriptsYet')}</div>;
    }

    const pageCount = Math.ceil(manuscriptCount / paginationSize);

    return (
      <>
        <table className="table is-fullwidth">
          <thead>
            <tr>
              <th>{t('mainIdentifier')}</th>
              <th>{t('status')}</th>
              <th>{t('creator')}</th>
            </tr>
          </thead>
          <tbody>
            {allManuscripts.map(({mainIdentifier: {identifier, identifierType}, status, creatorUsername}) =>
              <tr key={identifier}>
                <td>
                  <Link to={`manuscripts/${encodeURIComponent(identifier)}/data`}>
                    {identifier} ({identifierType})
                  </Link>
                </td>
                <td>{status}</td>
                <td>{creatorUsername}</td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination currentPage={page} pageCount={pageCount} previousPage={previousPage} goToPage={goToPage} nextPage={nextPage}/>
      </>
    );
  }

  return (
    <div className="container">
      <h1 className="title is-3 has-text-centered">{t('manuskript_plural')}</h1>

      {indexQuery.called && <WithQuery query={indexQuery} render={render}/>}

      <Link className="button is-link is-fullwidth" to={createManuscriptUrl}>
        {t('createManuscript')}
      </Link>
    </div>
  );
}
