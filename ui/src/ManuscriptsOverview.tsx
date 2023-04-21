import {ManuscriptBasicDataFragment} from './graphql';
import {useTranslation} from 'react-i18next';
import {PaginatedTable} from './PaginatedTable';
import {Link} from 'react-router-dom';

interface IProps {
  manuscriptCount: number;
  allManuscripts: ManuscriptBasicDataFragment[];
  queryPage: (number: number) => void;
  page: number;
}

export function ManuscriptsOverview({manuscriptCount, allManuscripts, queryPage, page}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  const columnNames = [t('mainIdentifier'), t('status'), t('creator')];

  return (
    <PaginatedTable count={manuscriptCount} data={allManuscripts} columnNames={columnNames} queryPage={queryPage} emptyMessage={t('noManuscriptsYet')}
                    page={page}>
      {({mainIdentifier: {identifier, identifierType}, status, creatorUsername}) =>
        <tr key={identifier} className="border-t border-slate-600 text-center">
          <td className="p-2">
            <Link to={`manuscripts/${encodeURIComponent(identifier)}/data`}>{identifier} ({identifierType})</Link>
          </td>
          <td className="p-2">{status}</td>
          <td className="p-2">{creatorUsername}</td>
        </tr>}
    </PaginatedTable>
  );
}