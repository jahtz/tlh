import {MergeLine} from './mergeDocument';
import {ReactElement} from 'react';
import {MergeDocumentLine} from './DocumentMerger';

interface IProps {
  entry: MergeLine | undefined;
  listMouseOver: () => void;
  handleDrag: () => void;
  handleDragOver: () => void;
  handleDragEnd: () => void;
  addLine: () => void;
  removeLine: () => void;
}

export const LineToMerger = ({entry, listMouseOver, handleDrag, handleDragEnd, handleDragOver, addLine, removeLine}: IProps): ReactElement => (

  <div className="px-1 my-1 rounded" onMouseOver={listMouseOver} draggable onDragStart={handleDrag} onDragEnd={handleDragEnd} onDragOver={handleDragOver}>

    <button className="mr-2 text-blue-500" onClick={addLine}>&#x2295;</button>
    {entry && <MergeDocumentLine line={entry}/>}

    {(entry === undefined || entry.lineNumberNode.tagName == 'EMPTY LINE') && <button className="mr-2 text-red-500" onClick={removeLine}>&#x2296;</button>}

  </div>

);