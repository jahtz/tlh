import {MergeLine} from './mergeDocument';
import {ReactElement} from 'react';
import {MergeDocumentLine} from './DocumentMerger';

interface IProps {
  isLeft: boolean;
  lines: (MergeLine | undefined)[];
  handleDrag: () => void;
  handleDragEnd: (isLeft: boolean) => void;
  handleDragOver: (isLeft: boolean, currentMouseIndex: number) => void;
  listMouseOver: (currentMouseIndex: number) => void;
  addLine: (isLeft: boolean, currentMouseIndex: number) => void;
  removeLine: (isLeft: boolean, currentIndex: number) => void;
}

const classes = 'p-2 rounded border border-slate-300 [&>*:nth-child(5n)]:bg-gray-300 grid-child-element draggablediv';

export const LineToMerge = ({isLeft, lines, handleDrag, handleDragEnd, handleDragOver, listMouseOver, addLine, removeLine}: IProps): ReactElement => (
  <ul className={classes} draggable onDragStart={handleDrag} onDragEnd={() => handleDragEnd(isLeft)}>
    {lines.map((entry, index) =>

      <li key={index} className="px-1 my-1 rounded" onMouseOver={() => listMouseOver(index)} onDragOver={() => handleDragOver(isLeft, index)}
          data-index={index} /* TODO: is attr. data-index needed? */>

        <button className="mr-2 text-blue-500" onClick={() => addLine(isLeft, index)}>&#x2295;</button>
        {entry && <MergeDocumentLine line={entry}/>}
        {(entry === undefined || entry.lineNumberNode.tagName == 'EMPTY LINE') &&
          <button className="mr-2 text-red-500" onClick={() => removeLine(isLeft, index)}>&#x2296;</button>}

      </li>)}
  </ul>
);