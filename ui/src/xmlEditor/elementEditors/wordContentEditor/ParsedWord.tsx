import {ReactElement, useState} from 'react';
import {Attributes, writeNode, XmlElementNode} from 'simple_xml';
import update from 'immutability-helper';
import {fetchMorphologicalAnalyses} from '../../../model/morphologicalAnalysis';
import {tlhXmlEditorConfig} from '../../tlhXmlEditorConfig';
import {NodeDisplay} from '../../NodeDisplay';
import {useTranslation} from 'react-i18next';
import {blueButtonClasses, whiteButtonClasses} from '../../../defaultDesign';

interface IProps {
  oldAttributes: Attributes;
  initialParsedWord: XmlElementNode<'w'>;
  language: string;
  submitEdit: (node: XmlElementNode<'w'>) => void;
}

export function ParsedWord({oldAttributes, initialParsedWord: initialParsedWord, language, submitEdit}: IProps): ReactElement {

  const {t} = useTranslation('common');
  const [parsedNode, setParsedNode] = useState(initialParsedWord);

  const copyMorphologicalAnalyses = (): void => setParsedNode((state) => update(state, {attributes: {$set: oldAttributes}}));

  const updateMorphologies = async (): Promise<void> => {
    try {
      const res = await fetchMorphologicalAnalyses(writeNode(parsedNode, tlhXmlEditorConfig.writeConfig).join(''), language);

      if (res) {
        setParsedNode((state) => update(state, {attributes: {$set: res}}));
      } else {
        alert('Could not find any morphological analyses...');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="p-2 rounded bg-white">
        <NodeDisplay rootNode={undefined} node={parsedNode} currentSelectedPath={undefined} isLeftSide={false}/>
      </div>

      <div className="mt-2 p-2 rounded bg-white">{writeNode(parsedNode, tlhXmlEditorConfig.writeConfig).join('')}</div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="text-center">
          <button type="button" className={whiteButtonClasses} onClick={copyMorphologicalAnalyses}>{t('copyMorphologicalAnalyses')}</button>
        </div>
        <div className="text-center">
          <button type="button" className={whiteButtonClasses} onClick={updateMorphologies}>{t('fetchMorphologicalAnalyses')}</button>
        </div>
      </div>

      <div className="text-center">
        <button type="button" className={blueButtonClasses} onClick={() => submitEdit(parsedNode)}>{t('submitEdit')}</button>
      </div>
    </>
  );
}