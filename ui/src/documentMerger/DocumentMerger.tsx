import {MergeDocument, MergeLine, mergeLines, replaceLNR, resetPublicationMap} from './mergeDocument';
import {ReactElement, useReducer, useState} from 'react';
import {zipWithOffset} from './zipWithOffset';
import {useTranslation} from 'react-i18next';
import {NodeDisplay} from '../xmlEditor/NodeDisplay';
import {xmlElementNode} from 'simple_xml';
import {LineToMerger} from './DocToMerge';
import {PublicationList} from './PublicationList';
import {PublicationMap} from './publicationMap';
import update from 'immutability-helper';

interface IProps {
  firstDocument: MergeDocument;
  secondDocument: MergeDocument;
  onMerge: (lines: MergeLine[], publicationMapping: PublicationMap) => void;
  mergedPublicationMapping: PublicationMap | undefined;
}

interface IState {
  firstLines: MergeLine[];
  secondLines: MergeLine[];
}

export const MergeDocumentLine = ({line}: { line: MergeLine }): ReactElement => (
  <>
    <NodeDisplay node={line.lineNumberNode} isLeftSide={false}/>
    {line.rest.map((n, index) => <NodeDisplay key={index} node={n} isLeftSide={false}/>)}
  </>
);

type UpdateLNR = (publication: string, newIndex: number, oldPublMap: PublicationMap, doFirst: boolean, doSecond: boolean) => PublicationMap;

function mergePublicationMap(leftMap: PublicationMap, rightMap: PublicationMap, updateLNR: UpdateLNR): PublicationMap {
  const leftIndices = Array.from(leftMap.keys());
  const rightIndices = Array.from(rightMap.keys());

  rightIndices
    .filter(value => leftIndices.includes(value))
    .reverse()
    .forEach((intersect) => {
        let newIndex = parseInt(intersect);

        while (leftIndices.includes(newIndex.toString()) || rightIndices.includes(newIndex.toString())) {
          newIndex++;
        }

        leftIndices.push(newIndex.toString());
        rightIndices.splice(rightIndices.indexOf(newIndex.toString()), 1);

        const mapIntersect = rightMap.get(intersect);

        if (mapIntersect) {
          // FIXME: remove updateLNR since it updates state!
          rightMap = updateLNR(mapIntersect[1], newIndex, rightMap, false, true);
        }
      }
    );

  return new Map([
    ...Array.from(leftMap.entries()),
    ...Array.from(rightMap.entries())
  ]);
}


export function DocumentMerger({firstDocument, secondDocument, onMerge}: IProps): ReactElement {

  const {t} = useTranslation('common');

  const [offset, setOffset] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startIndex, setStartIndex] = useState(0);

  const [{firstLines, secondLines}, setState] = useState<IState>({firstLines: firstDocument.lines, secondLines: secondDocument.lines});

  /** @deprecated */
  const forceUpdate = useReducer(() => ({}), {})[1] as () => void;

  let publicationMap: PublicationMap = new Map();
  if (secondDocument.mergedPublicationMapping === undefined) {
    secondDocument.mergedPublicationMapping = mergePublicationMap(firstDocument.publicationMap, secondDocument.publicationMap, updateLNR);
  }
  publicationMap = secondDocument.mergedPublicationMapping;

  removeDoubleUndefined();

  let data = zipWithOffset(firstLines, secondLines, offset);

  publicationMap = resetPublicationMap(publicationMap);

  const performMerge = (): void => onMerge(mergeLines(data), publicationMap);
  const handleDrag = (): void => setStartIndex(currentIndex);

  function handleDragEnd(isLeft: boolean): void {
    setOffset(
      isLeft ?
        -(currentIndex - startIndex - offset)
        : currentIndex - startIndex + offset
    );

    removeDoubleUndefined();
    data = zipWithOffset(firstLines, secondLines, offset);
    forceUpdate();
  }

  /** @deprecated */
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

      setState((state) => update(state, {
        firstLines: (fl) => fl.splice(index + 1, 0, {lineNumberNode: xmlElementNode('EMPTY LINE'), rest: []})
      }));
    } else {
      if (offset > 0) {
        index = index - offset;
      }

      // FIXME: wtf?
      const undef: unknown = undefined;

      setState((state) => update(state, {
        secondLines: (sl) => sl.splice(index + 1, 0, undef as MergeLine)
      }));
    }
  };

  function removeLine(isLeft: boolean, index: number): void {
    if (isLeft && (firstLines[index] === undefined || firstLines[index].lineNumberNode.tagName == 'EMPTY LINE')) {
      if (offset < 0) {
        index = index + offset;
      }

      setState((state) => update(state, {firstLines: (fl) => fl.splice(index, 1)}));
    } else if (secondLines[index] === undefined || secondLines[index].lineNumberNode.tagName == 'EMPTY LINE') {
      if (offset > 0) {
        index = index - offset;
      }

      setState((state) => update(state, {secondLines: (sl) => sl.splice(index, 1)}));
    }
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

      <div className="[&>*:nth-child(5n)]:bg-gray-300">
        {data.map(([leftLine, rightLine], index) =>
          <div key={index} className="grid grid-cols-2 gap-2">
            <LineToMerger entry={leftLine} handleDrag={handleDrag} handleDragEnd={() => handleDragEnd(true)} handleDragOver={() => handleDragOver(true, index)}
                          listMouseOver={() => setCurrentIndex(index)} addLine={() => addLine(true, index)} removeLine={() => removeLine(true, index)}/>

            <LineToMerger entry={rightLine} handleDrag={handleDrag} handleDragEnd={() => handleDragEnd(false)}
                          handleDragOver={() => handleDragOver(false, index)} listMouseOver={() => setCurrentIndex(index)} addLine={() => addLine(false, index)}
                          removeLine={() => removeLine(false, index)}/>
          </div>)}
      </div>
    </>
  );
}