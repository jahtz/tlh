import classNames from 'classnames';

interface IProps {
  currentPage: number;
  pageCount: number;
  previousPage: () => void;
  goToPage: (page: number) => void;
  nextPage: () => void;
}

export function Pagination({currentPage, pageCount, previousPage, goToPage, nextPage}: IProps): JSX.Element {
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