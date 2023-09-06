import {MergeDocument, MergeLine, mergeLines, replaceLNR, resetPublicationMap} from './mergeDocument';
import {ReactElement, useReducer, useState} from 'react';
import {zipWithOffset} from './zipWithOffset';
import {useTranslation} from 'react-i18next';
import {NodeDisplay} from '../xmlEditor/NodeDisplay';
import {xmlElementNode} from 'simple_xml';
import {LineToMerge} from './LineToMerge';
import {PublicationList} from './PublicationList';
import {PublicationMap} from './publicationMap';


interface IProps {
  firstDocument: MergeDocument;
  secondDocument: MergeDocument;
  onMerge: (lines: MergeLine[], publicationMapping: PublicationMap) => void;
  mergedPublicationMapping: PublicationMap | undefined;
}

export const MergeDocumentLine = ({line}: { line: MergeLine }): ReactElement => (
  <>
    <NodeDisplay node={line.lineNumberNode} isLeftSide={false}/>
    {line.rest.map((n, index) => <NodeDisplay key={index} node={n} isLeftSide={false}/>)}
  </>
);

export function DocumentMerger({firstDocument, secondDocument, onMerge}: IProps): ReactElement {

  const {t} = useTranslation('common');
  const [offset, setOffset] = useState(0);
  const forceUpdate = useReducer(() => ({}), {})[1] as () => void;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [startIndex, setStartIndex] = useState(0);

  let firstLines = firstDocument.lines;
  let secondLines = secondDocument.lines;

  let publicationMap: PublicationMap = new Map();
  if (secondDocument.mergedPublicationMapping === undefined) {
    secondDocument.mergedPublicationMapping = mergePublicationMap(firstDocument.publicationMap, secondDocument.publicationMap);
  }
  publicationMap = secondDocument.mergedPublicationMapping;

  removeDoubleUndefined();

  let data = zipWithOffset(firstLines, secondLines, offset);

  const leftList = data.map((d) => d[0]);
  const rightList = data.map((d) => d[1]);

  publicationMap = resetPublicationMap(publicationMap);

  const performMerge = (): void => onMerge(mergeLines(data), publicationMap);
  const handleDrag = (): void => setStartIndex(currentIndex);

  function handleDragEnd(isLeft: boolean): void {
    const offset1 = (isLeft ? -(currentIndex - startIndex - offset) : (currentIndex - startIndex + offset));
    setOffset(offset1);
    removeDoubleUndefined();
    data = zipWithOffset(firstLines, secondLines, offset);
    forceUpdate();
  }

  function removeDoubleUndefined(): void {
    let max_length = Math.max(firstLines.length, secondLines.length);

    for (let i = 0; i < max_length; i++) {
      if (firstLines[i] === undefined && secondLines[i] === undefined) {
        firstLines.splice(i, 1);
        secondLines.splice(i, 1);
        max_length--;
      }
    }
  }

  function handleDragOver(isLeft: boolean, currentMouseIndex: number): void {
    // TODO: fix broken offset update onDragOver
    setCurrentIndex(currentMouseIndex);
  }

  const addLine = (isLeft: boolean, index: number): void => {
    if (isLeft) {
      if (offset < 0) {
        index = index + offset;
      }
      firstLines = firstLines.splice(index + 1, 0, {lineNumberNode: xmlElementNode('EMPTY LINE'), rest: []});
    } else {
      const undef: unknown = undefined;

      if (offset > 0) {
        index = index - offset;
      }
      // FIXME: wtf?
      secondLines = secondLines.splice(index + 1, 0, undef as MergeLine);
    }

    //removeDoubleUndefined();
    data = zipWithOffset(firstLines, secondLines, offset);
    forceUpdate();
  };

  function removeLine(isLeft: boolean, index: number): void {
    if (isLeft && (firstLines[index] === undefined || firstLines[index].lineNumberNode.tagName == 'EMPTY LINE')) {
      if (offset < 0) {
        index = index + offset;
      }
      firstLines.splice(index, 1);
    } else if (secondLines[index] === undefined || secondLines[index].lineNumberNode.tagName == 'EMPTY LINE') {
      if (offset > 0) {
        index = index - offset;
      }
      secondLines.splice(index, 1);
    }
    forceUpdate();
  }

  function updateLNR(publication: string, newIndex: number, oldPublMap: PublicationMap, doFirst: boolean, doSecond: boolean): PublicationMap {
    const publIndices: number[] = Array.from(oldPublMap.values()).map(([fragmentNumber]) => fragmentNumber);

    //check if valid
    if (newIndex > 0 && !(publIndices.includes(newIndex, 0))) {
      Array.from(oldPublMap.entries()).map((entry) => {
        const oldIndex = entry[0];
        const item = entry[1];
        if (item[1] == publication) {
          const index = item[0];
          item[0] = newIndex;
          oldPublMap.delete(oldIndex);
          oldPublMap.set((index).toString(), item);
        }
      });

      if (doFirst) {
        Array.from(firstLines).map((entry) => {
          if (entry) {
            const lnn = entry.lineNumberNode;
            lnn.attributes['lnr'] = replaceLNR(lnn, oldPublMap);
          }
        });
      }

      if (doSecond) {
        Array.from(secondLines).map((entry) => {
          if (entry) {
            const lnn = entry.lineNumberNode;
            lnn.attributes['lnr'] = replaceLNR(lnn, oldPublMap);
          }
        });
      }

      oldPublMap = resetPublicationMap(oldPublMap);
    }

    //forceUpdate();
    return oldPublMap;
  }

  function mergePublicationMap(leftMap: PublicationMap, rightMap: PublicationMap): PublicationMap {
    const leftIndices = Array.from(leftMap.keys());
    const rightIndices = Array.from(rightMap.keys());

    const indexIntersection = rightIndices.filter(value => leftIndices.includes(value));
    for (const intersect of indexIntersection.reverse()) {
      let newIndex = intersect;

      while (leftIndices.includes(newIndex, 0) || rightIndices.includes(newIndex, 0)) {
        newIndex = (parseInt(newIndex) + 1).toString();
      }

      leftIndices.push(newIndex);
      rightIndices.splice(rightIndices.indexOf(newIndex, 0), 1);

      const mapIntersect = rightMap.get(intersect);
      if (mapIntersect) {
        // FIXME: remove updateLNR!
        rightMap = updateLNR(mapIntersect[1], parseInt(newIndex.toString()), rightMap, false, true);
      }
    }

    return new Map([...Array.from(leftMap.entries()), ...Array.from(rightMap.entries())]);
  }

  const onPublicationListChange = (newValue: number, identifier: string): void => {
    publicationMap = updateLNR(identifier, newValue, publicationMap, true, true);
    publicationMap = resetPublicationMap(publicationMap);
    forceUpdate();
  };

  return (
    <>
      <div className="my-2 grid grid-cols-5 gap-2">
        <span className="p-2 rounded border border-slate-500">{t('offset')}</span>
        <button className="p-2 rounded border border-slate-500" type="button" onClick={() => setOffset((value) => value - 1)}>&#x2207;</button>
        <input className="p-2 rounded border border-slate-500" type="number" value={offset} onChange={(event) => setOffset(parseInt(event.target.value))}/>
        <button className="p-2 rounded border border-slate-500" type="button" onClick={() => setOffset((value) => value + 1)}>&#x2206;</button>
        <button className="p-2 rounded border bg-blue-600 text-white" type="button" onClick={performMerge}>{t('performMerge')}</button>
      </div>

      <PublicationList publicationMap={publicationMap} onChange={onPublicationListChange}/>

      <div className="grid grid-cols-2 gap-2">
        <LineToMerge isLeft={true} lines={leftList} handleDrag={handleDrag} handleDragEnd={handleDragEnd} handleDragOver={handleDragOver}
                     listMouseOver={setCurrentIndex} addLine={addLine} removeLine={removeLine}/>
        <LineToMerge isLeft={false} lines={rightList} handleDrag={handleDrag} handleDragEnd={handleDragEnd} handleDragOver={handleDragOver}
                     listMouseOver={setCurrentIndex} addLine={addLine} removeLine={removeLine}/>
      </div>
    </>
  );
}