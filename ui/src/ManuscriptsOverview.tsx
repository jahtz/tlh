import {Link} from 'react-router-dom';
import {MyPagination} from './genericElements/pagination';
import {ManuscriptBasicDataFragment} from './graphql';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';

interface IProps {
  manuscriptCount: number;
  allManuscripts: ManuscriptBasicDataFragment[];
  queryPage: (number: number) => void;
}

export const initialPage = 0;
export const paginationSize = 10;

export function ManuscriptsOverview({manuscriptCount, allManuscripts, queryPage}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [page, setPage] = useState(initialPage);

  const previousPage = (): void => page > 0 ? goToPage(page - 1) : void 0;
  const nextPage = (): void => goToPage(page + 1);

  function goToPage(pageNumber: number): void {
    setPage(pageNumber);
    queryPage(pageNumber);
  }

  const pageCount = Math.ceil(manuscriptCount / paginationSize);

  return allManuscripts.length === 0
    ? <p className="italic text-cyan-500 text-center">{t('noManuscriptsYet')}</p>
    : (
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
                  <Link to={`manuscripts/${encodeURIComponent(identifier)}/data`}>{identifier} ({identifierType})</Link>
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