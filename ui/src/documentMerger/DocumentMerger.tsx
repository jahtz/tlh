import {MergeDocument, MergeLine} from './mergeDocument';
import {useState} from 'react';
import {NodeDisplay} from '../editor/NodeDisplay';
import {zipWithOffset} from './zipWithOffset';
import {useTranslation} from 'react-i18next';
import {IoChevronDown, IoChevronUp} from 'react-icons/io5';
import {tlhXmlEditorConfig} from '../editor/editorConfig/tlhXmlEditorConfig';

interface IProps {
  firstDocument: MergeDocument;
  secondDocument: MergeDocument;
}

const editorConfig = tlhXmlEditorConfig(false);

function MergeDocumentLine({line}: { line: MergeLine }): JSX.Element {
  return (
    <>
      <NodeDisplay node={line.lb} editorConfig={editorConfig}/>
      {line.rest.map((n, index) => <NodeDisplay key={index} node={n}/>)}
    </>
  );
}

export function DocumentMerger({firstDocument, secondDocument}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [offset, setOffset] = useState(0);

  const data = zipWithOffset(firstDocument.lines, secondDocument.lines, offset);

  return (
    <>
      <div className="field has-addons">
        <div className="control">
          <button className="button is-static">{t('offset')}</button>
        </div>
        <div className="control">
          <button type="button" className="button" onClick={() => setOffset((value) => value - 1)}><IoChevronDown/></button>
        </div>
        <div className="control is-expanded">
          <input type="number" className="input" value={offset} onChange={(event) => setOffset(parseInt(event.target.value))}/>
        </div>
        <div className="control">
          <button type="button" className="button" onClick={() => setOffset((value) => value + 1)}><IoChevronUp/></button>
        </div>
        <div className="control is-expanded">
          <button type="button" className="button is-link is-fullwidth" disabled>{t('performMerge')}</button>
        </div>
      </div>

      <table className="table is-fullwidth">
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