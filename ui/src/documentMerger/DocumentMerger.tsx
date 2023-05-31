import {MergeDocument, MergeLine, mergeLines, replaceLNR, resetPublicationMap} from './mergeDocument';
import {JSX, useReducer, useState} from 'react';
import {zipWithOffset} from './zipWithOffset';
import {useTranslation} from 'react-i18next';
import {IoAddCircleOutline, IoChevronDown, IoChevronUp, IoRemoveCircleOutline} from 'react-icons/io5';
import {NodeDisplay} from '../xmlEditor/NodeDisplay';

interface IProps {
  firstDocument: MergeDocument;
  secondDocument: MergeDocument;
  //publicationMap: Map<string, string[]>;
  onMerge: (lines: MergeLine[], publicationMapping: Map<string, string[]>) => void;
  MergedPublicationMapping: Map<string, string[]> | undefined;
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
  const forceUpdate = useReducer(() => ({}), {})[1] as () => void;

  let firstLines = firstDocument.lines;
  const firstPublMap = firstDocument.publMap;
  let secondLines = secondDocument.lines;
  const secondPublMap = secondDocument.publMap;

  let publicationMap: Map<string, string[]> = new Map<string, string[]>();
  if (secondDocument.MergedPublicationMapping === undefined) {
    secondDocument.MergedPublicationMapping = mergePublicationMap(firstPublMap, secondPublMap);
  }
  publicationMap = secondDocument.MergedPublicationMapping;

  removeDoubleUndefined();

  let data = zipWithOffset(firstLines, secondLines, offset);
  const leftList = (() => {
    const list = [];
    for (let i = 0; i < data.length; i++) {
      list.push(data[i][0]);
    }
    return list;
  })();
  const rightList = (() => {
    const list = [];
    for (let i = 0; i < data.length; i++) {
      list.push(data[i][1]);
    }
    return list;
  })();
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
    if (isLeft) {
      if (offset < 0) index = index + offset;
      firstLines = firstLines.splice(index + 1, 0, undef as MergeLine);
    } else {
      if (offset > 0) index = index - offset;
      secondLines = secondLines.splice(index + 1, 0, undef as MergeLine);
    }
    //removeDoubleUndefined();
    data = zipWithOffset(firstLines, secondLines, offset);
    forceUpdate();
  };

  function removeLine(isLeft: boolean, index: number): void {
    if (isLeft && firstLines[index] === undefined) {
      if (offset < 0) index = index + offset;
      firstLines.splice(index, 1);
    } else if (secondLines[index] === undefined) {
      if (offset > 0) index = index - offset;
      secondLines.splice(index, 1);
    }
    forceUpdate();
  }

  function updateLNR(publication: string, newIndex: number, oldPublMap: Map<string, string[]>, doFirst: boolean, doSecond: boolean) {
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

  function mergePublicationMap(leftMap: Map<string, string[]>, rightMap: Map<string, string[]>) {
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

  function PublicationList({publMap}: { publMap: Map<string, string[]> }): JSX.Element {
    return (
      <ul className="grid-container-element-header publication">
        {
          Array.from(publMap.values()).map((item, i) => <PublicationLine publicationString={item} key={i}></PublicationLine>)
        }
      </ul>
    );
  }

  function PublicationLine({publicationString}: { publicationString: string[] }): JSX.Element {
    return (
      <li className="grid-child-element-header publication">
        <span className="publication grid-child-element">{publicationString[1]}</span>
        <span className="publication grid-child-element">€&nbsp;
          <input type="number" defaultValue={publicationString[0]} onChange={(event) => {
            publicationMap = updateLNR(publicationString[1], Number.parseInt(event.target.value), publicationMap, true, true);
            publicationMap = resetPublicationMap(publicationMap);
            forceUpdate();
          }}></input></span>
      </li>
    );
  }

  function LeftList() {
    return (
      <ul className="grid-child-element draggablediv" draggable="true" onDragStart={handleDrag} onDragEnd={() => handleDragEnd(true)}>
        {leftList.map((entry, index) => <li className={index % 5 == 4 && 'marker' || undefined} onMouseOver={() => listMouseOver(index)}
                                            onDragOver={() => handleDragOver(true, index)} data-index={index} key={index}>
          <button onClick={() => addLine(true, index)}><IoAddCircleOutline/></button>
          {entry && <MergeDocumentLine line={entry}/>}
          {entry === undefined && <>
            <button onClick={() => removeLine(true, index)}><IoRemoveCircleOutline/></button>
            <br/></>}
        </li>)}
      </ul>
    );
  }

  function RightList() {
    return (
      <ul className="grid-child-element draggablediv" draggable="true" onDragStart={handleDrag} onDragEnd={() => handleDragEnd(false)}>
        {rightList.map((entry, index) => <li className={index % 5 == 4 && 'marker' || undefined} onMouseOver={() => listMouseOver(index)}
                                             onDragOver={() => handleDragOver(false, index)} data-index={index} key={index}>
          <button onClick={() => addLine(false, index)}><IoAddCircleOutline/></button>
          {entry && <MergeDocumentLine line={entry}/>}
          {entry === undefined && <>
            <button onClick={() => removeLine(false, index)}><IoRemoveCircleOutline/></button>
            <br/></>}
        </li>)}
      </ul>
    );
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
      <div className="grid-container-element-header">
        <PublicationList publMap={publicationMap}/>
      </div>

      <div className="grid-container-element">
        <LeftList/>
        <RightList/>
      </div>
    </>
  );
}