import {MergeDocument, MergeLine, mergeLines, replaceLNR, resetPublicationMap} from './mergeDocument';
import {ReactElement, useReducer, useState} from 'react';
import {zipWithOffset} from './zipWithOffset';
import {useTranslation} from 'react-i18next';
import {NodeDisplay} from '../xmlEditor/NodeDisplay';
import {xmlElementNode} from 'simple_xml';
import {LineToMerge} from './LineToMerge';
import {PublicationList} from './PublicationList';

export type PublicationMap = Map<string, string[]>;

interface IProps {
  firstDocument: MergeDocument;
  secondDocument: MergeDocument;
  onMerge: (lines: MergeLine[], publicationMapping: PublicationMap) => void;
  MergedPublicationMapping: PublicationMap | undefined;
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

  let firstLines = firstDocument.lines;
  const firstPublMap = firstDocument.publicationMap;
  let secondLines = secondDocument.lines;
  const secondPublMap = secondDocument.publicationMap;

  let publicationMap: PublicationMap = new Map();
  if (secondDocument.MergedPublicationMapping === undefined) {
    secondDocument.MergedPublicationMapping = mergePublicationMap(firstPublMap, secondPublMap);
  }
  publicationMap = secondDocument.MergedPublicationMapping;

  removeDoubleUndefined();

  let data = zipWithOffset(firstLines, secondLines, offset);

  const leftList = data.map((d) => d[0]);
  const rightList = data.map((d) => d[1]);

  publicationMap = resetPublicationMap(publicationMap);
  console.log(publicationMap);
  console.log(data);

  function performMerge(): void {
    onMerge(mergeLines(data), publicationMap);
  }

  let startIndex = 0;
  let currentIndex = 0;

  function handleDrag(): void {
    startIndex = currentIndex;
  }

  function handleDragEnd(isLeft: boolean): void {
    const offset1 = (isLeft ? -(currentIndex - startIndex - offset) : (currentIndex - startIndex + offset));
    setOffset(offset1);
    removeDoubleUndefined();
    data = zipWithOffset(firstLines, secondLines, offset);
    forceUpdate();
  }

  function removeDoubleUndefined(): void {
    let max_length: number = firstLines.length > secondLines.length ? firstLines.length : secondLines.length;
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
    currentIndex = currentMouseIndex;
  }

  function listMouseOver(currentMouseIndex: number): void {
    currentIndex = currentMouseIndex;
  }

  const addLine = (isLeft: boolean, index: number): void => {
    const undef: unknown = undefined;
    const emptyLine: MergeLine = {lineNumberNode: xmlElementNode('EMPTY LINE', {}, []), rest: []};

    if (isLeft) {
      if (offset < 0) index = index + offset;
      firstLines = firstLines.splice(index + 1, 0, emptyLine as MergeLine);
    } else {
      if (offset > 0) index = index - offset;
      secondLines = secondLines.splice(index + 1, 0, undef as MergeLine);
    }
    //removeDoubleUndefined();
    data = zipWithOffset(firstLines, secondLines, offset);
    forceUpdate();
  };

  function removeLine(isLeft: boolean, index: number): void {
    if (isLeft && (firstLines[index] === undefined || firstLines[index].lineNumberNode.tagName == 'EMPTY LINE')) {
      if (offset < 0) index = index + offset;
      firstLines.splice(index, 1);
    } else if (secondLines[index] === undefined || secondLines[index].lineNumberNode.tagName == 'EMPTY LINE') {
      if (offset > 0) index = index - offset;
      secondLines.splice(index, 1);
    }
    forceUpdate();
  }

  function updateLNR(publication: string, newIndex: number, oldPublMap: PublicationMap, doFirst: boolean, doSecond: boolean): PublicationMap {
    const publIndices: number[] = Array.from(oldPublMap.values()).map((item) => parseInt(item[0]));

    //check if valid
    if (newIndex > 0 && !(publIndices.includes(newIndex, 0))) {
      Array.from(oldPublMap.entries()).map((entry) => {
        const oldIndex = entry[0];
        const item = entry[1];
        if (item[1] == publication) {
          const index = item[0];
          item[0] = newIndex.toString();
          oldPublMap.delete(oldIndex);
          oldPublMap.set((parseInt(index)).toString(), item);
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
      <div className="my-2 grid grid-cols-5">
        <span className="p-2 border border-slate-500 rounded-l">{t('offset')}</span>
        <button className="p-2 border border-slate-500" type="button" onClick={() => setOffset((value) => value - 1)}>&#x2207;</button>
        <input className="p-2 border border-slate-500" type="number" value={offset} onChange={(event) => setOffset(parseInt(event.target.value))}/>
        <button className="p-2 border border-slate-500" type="button" onClick={() => setOffset((value) => value + 1)}>&#x2206;</button>
        <button className="p-2 border bg-blue-600 text-white rounded-r" type="button" onClick={performMerge}>{t('performMerge')}</button>
      </div>

      <PublicationList publicationMap={publicationMap} onChange={onPublicationListChange}/>

      <div className="grid grid-cols-2 gap-2">
        <LineToMerge isLeft={true} lines={leftList} handleDrag={handleDrag} handleDragEnd={handleDragEnd} handleDragOver={handleDragOver}
                     listMouseOver={listMouseOver} addLine={addLine} removeLine={removeLine}/>
        <LineToMerge isLeft={false} lines={rightList} handleDrag={handleDrag} handleDragEnd={handleDragEnd} handleDragOver={handleDragOver}
                     listMouseOver={listMouseOver} addLine={addLine} removeLine={removeLine}/>
      </div>
    </>
  );
}