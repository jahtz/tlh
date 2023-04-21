import {MyPagination} from './genericElements/MyPagination';

interface IProps<T> {
  count: number;
  data: T[];
  columnNames: string[];
  children: (t: T) => JSX.Element;
  queryPage: (number: number) => void;
  emptyMessage: string;
  page: number;
}

export function PaginatedTable<T>({count, data, columnNames, children, queryPage, emptyMessage, page}: IProps<T>): JSX.Element {

  const previousPage = (): void => page > 0 ? queryPage(page - 1) : void 0;
  const nextPage = (): void => queryPage(page + 1);

  const pageCount = Math.ceil(count / 10);

  return data.length === 0
    ? <p className="italic text-cyan-500 text-center">{emptyMessage}</p>
    : (
      <>
        <table className="table-auto w-full border-collapse">
          <thead>
            <tr className="text-center border-b-2 border-slate-500">
              {columnNames.map((columnName) => <th className="p-2" key={columnName}>{columnName}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => children(row))}
          </tbody>
        </table>

        <MyPagination currentPage={page} pageCount={pageCount} previousPage={previousPage} goToPage={queryPage} nextPage={nextPage}/>
      </>
    );
}