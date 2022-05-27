import {MergeDocument, MergeLine, mergeLines} from './mergeDocument';
import {useState} from 'react';
import {zipWithOffset} from './zipWithOffset';
import {useTranslation} from 'react-i18next';
import {IoChevronDown, IoChevronUp} from 'react-icons/io5';
import {NodeDisplay} from '../xmlEditor/NodeDisplay';

interface IProps {
  firstDocument: MergeDocument;
  secondDocument: MergeDocument;
  onMerge: (lines: MergeLine[]) => void;
}

export function MergeDocumentLine({line}: { line: MergeLine }): JSX.Element {
  return (
    <>
      <NodeDisplay node={line.lineNumberNode} isLeftSide={false}/>
      {line.rest.map((n, index) => <NodeDisplay key={index} node={n} isLeftSide={false}/>)}
    </>
  );
}

export function DocumentMerger({firstDocument, secondDocument, onMerge}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [offset, setOffset] = useState(0);

  const data = zipWithOffset(firstDocument.lines, secondDocument.lines, offset);

  function performMerge(): void {
    onMerge(mergeLines(data));
  }

  return (
    <>
      <div className="grid grid-cols-5 mb-2">
        <span className="p-2 border border-slate-500 rounded-l">{t('offset')}</span>
        <button className="p-2 border border-slate-500" type="button" onClick={() => setOffset((value) => value - 1)}><IoChevronDown/></button>
        <input className="p-2 border border-slate-500" type="number" value={offset} onChange={(event) => setOffset(parseInt(event.target.value))}/>
        <button className="p-2 border border-slate-500" type="button" onClick={() => setOffset((value) => value + 1)}><IoChevronUp/></button>
        <button className="p-2 border bg-blue-600 text-white rounded-r" type="button" onClick={performMerge}>{t('performMerge')}</button>
      </div>

      <table className="table-fixed w-full">
        <tbody>
          {data.map(([left, right], index) => <tr key={index}>
            {left && <td colSpan={right ? 1 : 2} className="has-text-centered"><MergeDocumentLine line={left}/></td>}
            {right && <td colSpan={left ? 1 : 2} className="has-text-centered"><MergeDocumentLine line={right}/></td>}
          </tr>)}
        </tbody>
      </table>
    </>
  );
}