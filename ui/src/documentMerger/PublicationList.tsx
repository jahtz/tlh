import {ReactElement} from 'react';
import {PublicationMap} from './DocumentMerger';


interface PublicationListProps {
  publicationMap: PublicationMap;
  onChange: (newNumber: number, identifier: string) => void;
}

export function PublicationList({publicationMap, onChange}: PublicationListProps): ReactElement {
  const sortedValues = Array.from(publicationMap.values())
    .sort(([/* _a */, a], [/* _b */, b]) => {
      return a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'});
    });

  return (
    <div className="my-2 p-2 rounded border border-slate-500 content-center">
      <table className="table-auto mx-auto">
        {sortedValues.map(([fragmentNumber, identifier]) =>
          <tr key={fragmentNumber} className="w-full">
            <td className="px-4">{identifier}</td>
            <td className="px-4">
              €&nbsp;
              <input type="number" className="px-2" defaultValue={fragmentNumber} onChange={(event) => onChange(parseInt(event.target.value), identifier)}/>
            </td>
          </tr>
        )}
      </table>
    </div>
  );
}

