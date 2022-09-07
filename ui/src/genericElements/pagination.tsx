import classNames from 'classnames';
import {useTranslation} from 'react-i18next';

interface IProps {
  currentPage: number;
  pageCount: number;
  previousPage: () => void;
  goToPage: (page: number) => void;
  nextPage: () => void;
}

export function MyPagination({currentPage, pageCount, previousPage, goToPage, nextPage}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <nav className="text-center">
      <button type="button" className="px-4 py-2 rounded border border-slate-500 mr-4" onClick={previousPage}>{t('previousPage')}</button>
      {Array.from({length: pageCount}, (_x, i) => i).map((i) =>
        <button className={classNames('px-4', 'py-2', 'rounded', currentPage === i ? ['text-white', 'bg-blue-600'] : [])} key={i} onClick={() => goToPage(i)}>
          {i}
        </button>
      )}
      <button type="button" className="px-4 py-2 rounded border border-slate-500 ml-4" onClick={nextPage}>{t('nextPage')}</button>
    </nav>
  );
}