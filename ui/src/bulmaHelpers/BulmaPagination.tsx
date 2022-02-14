import classNames from 'classnames';
import {useTranslation} from 'react-i18next';

interface IProps {
  currentPage: number;
  pageCount: number;
  previousPage: () => void;
  goToPage: (page: number) => void;
  nextPage: () => void;
}

export function BulmaPagination({currentPage, pageCount, previousPage, goToPage, nextPage}: IProps): JSX.Element {
  return (
    <nav className="pagination is-centered" role="navigation" aria-label="pagination">
      <button className="pagination-previous" onClick={previousPage} disabled={currentPage <= 0}>Previous</button>
      <ul className="pagination-list">
        {Array.from({length: pageCount}, (x, i) => i).map((i) =>
          <li key={i}>
            <a className={classNames('pagination-link', {'is-current': currentPage === i})} onClick={() => goToPage(i)}>{i}</a>
          </li>
        )}
      </ul>
      <button className="pagination-next" onClick={nextPage} disabled={currentPage >= pageCount - 1}>Next page</button>
    </nav>
  );
}

export function MyPagination({currentPage, pageCount, previousPage, goToPage, nextPage}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <nav className="text-center">
      <button type="button" className="px-4 py-2 rounded border border-slate-500 mr-4">{t('previousPage')}</button>
      {Array.from({length: pageCount}, (_x, i) => i).map((i) =>
        <button className={classNames('px-4', 'py-2', 'rounded', currentPage === i ? ['text-white', 'bg-blue-600'] : [])} key={i}>{i}</button>
      )}
      <button type="button" className="px-4 py-2 rounded border border-slate-500 ml-4">{t('nextPage')}</button>
    </nav>
  );
}