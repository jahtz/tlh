import {ReactElement, useState} from 'react';
import {writeNode, XmlElementNode} from 'simple_xml';
import update from 'immutability-helper';
import {fetchMorphologicalAnalyses} from '../../../model/morphologicalAnalysis';
import {tlhXmlEditorConfig} from '../../tlhXmlEditorConfig';
import {NodeDisplay} from '../../NodeDisplay';
import {useTranslation} from 'react-i18next';

interface IProps {
  oldNode: XmlElementNode<'w'>;
  initialParsedWord: XmlElementNode<'w'>;
  language: string;
  submitEdit: (node: XmlElementNode<'w'>) => void;
}

export function ParsedWord({oldNode, initialParsedWord: initialParsedWord, language, submitEdit}: IProps): ReactElement {

  const {t} = useTranslation('common');
  const [parsedNode, setParsedNode] = useState(initialParsedWord);

  const copyMorphologicalAnalyses = (): void => setParsedNode((state) => update(state, {attributes: {$set: oldNode.attributes}}));

  const updateMorphologies = (): Promise<void> => fetchMorphologicalAnalyses(writeNode(parsedNode, tlhXmlEditorConfig.writeConfig).join(''), language)
    .then((res) => {
      if (res) {
        setParsedNode((state) => update(state, {attributes: {$set: res}}));
      } else {
        alert('Could not find any morphological analyses...');
      }
    })
    .catch((err) => console.error(err));

  return (
    <>
      <div className="p-2 rounded bg-white">
        <NodeDisplay rootNode={undefined} node={parsedNode} currentSelectedPath={undefined} isLeftSide={false}/>
      </div>

      <div className="mt-2 p-2 rounded bg-white">{writeNode(parsedNode, tlhXmlEditorConfig.writeConfig).join('')}</div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" className="p-2 rounded border border-slate-500 bg-white w-full" onClick={copyMorphologicalAnalyses}>
          {t('copyMorphologicalAnalyses')}
        </button>
        <button type="button" className="p-2 rounded border border-slate-500 bg-white w-full" onClick={updateMorphologies}>
          {t('fetchMorphologicalAnalyses')}
        </button>
      </div>

      <button type="button" onClick={() => submitEdit(parsedNode)} className="mt-4 p-2 rounded bg-blue-600 text-white w-full">{t('submitEdit')}</button>
    </>
  );
}