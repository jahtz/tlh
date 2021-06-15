import {XmlEditableNodeIProps} from './xmlDisplayConfigs';
import {
  isSelected,
  morphSplitCharacter,
  readSelectedMorphology,
  SelectedAnalysisOption,
  selectedAnalysisOptionEquals,
  stringifySelectedAnalysisOption
} from './selectedAnalysisOption';
import {useTranslation} from 'react-i18next';
import React, {useState} from 'react';
import {AnalysisOption, MorphologicalAnalysis, readMorphAnalysis} from '../model/morphologicalAnalysis';
import {XmlAttribute} from './xmlModel';
import {MorphAnalysisOption} from './MorphologicalAnalysisOption';

const morphologyAttributeNameRegex = /^mrp(\d+)$/;

export function WordNodeEditor({props: {node, renderedChildren, updateNode, path}}: { props: XmlEditableNodeIProps }): JSX.Element {

  const initialSelectedMorphologies: SelectedAnalysisOption[] = readSelectedMorphology(
    node.attributes.find(({name}) => name === 'mrp0sel')?.value?.trim() || ''
  );

  const {t} = useTranslation('common');
  const [selectedMorphologies, setSelectedMorphologies] = useState<SelectedAnalysisOption[]>(initialSelectedMorphologies);

  const morphologies = node.attributes
    .map(({name, value}) => {
      const match = name.trim().match(morphologyAttributeNameRegex);

      if (match) {
        return readMorphAnalysis(parseInt(match[1]), value);
      }
    })
    .filter((m): m is MorphologicalAnalysis => !!m);


  function getMorphologicalAnalysisOption(identifier: SelectedAnalysisOption): string | AnalysisOption {
    const morphAnalysis = morphologies.find(({number}) => number === identifier.num)!!;

    return typeof morphAnalysis.analyses === 'string'
      ? morphAnalysis.analyses
      : morphAnalysis.analyses.find(({letter}) => identifier.letter === letter)!!;
  }

  function resetMorphAnalysis(): void {
    setSelectedMorphologies(initialSelectedMorphologies);
  }

  function handleUpdate(): void {
    const newValue = selectedMorphologies.map(stringifySelectedAnalysisOption).join(morphSplitCharacter);

    const attributes: XmlAttribute[] = node.attributes.map((attr) => {
      return attr.name === 'mrp0sel'
        ? {__type: 'XmlAttribute', name: attr.name, value: newValue}
        : attr;
    });

    updateNode({...node, attributes}, path);
  }

  function updateSelected(newValue: SelectedAnalysisOption, ctrl: boolean): void {
    setSelectedMorphologies((currentSelection) => {
      return ctrl
        ? (isSelected(newValue, currentSelection)
          ? currentSelection.filter((v) => !selectedAnalysisOptionEquals(v, newValue))
          : [...currentSelection, newValue])
        : [newValue];
    });
  }

  return (
    <div>
      <div className="box has-text-centered">{renderedChildren}</div>

      {morphologies.map((m, index) =>
        <MorphAnalysisOption key={index} ma={m} selectedOption={selectedMorphologies} updateSelected={updateSelected}/>
      )}

      {selectedMorphologies && <>
        <hr/>

        <div className="box has-text-centered">
          <p>{t('selected')}:</p>
          {/*TODO: show selected morphologies!*/}
          {selectedMorphologies.map((selectedMorph) => {

            const analysis = getMorphologicalAnalysisOption(selectedMorph);

            return <p key={stringifySelectedAnalysisOption(selectedMorph)}>
              {stringifySelectedAnalysisOption(selectedMorph)}: {typeof analysis === 'string' ? analysis : analysis.analysis}
            </p>;
          })}
        </div>

        <div className="level">
          <div className="level-item">
            <button onClick={resetMorphAnalysis} className="button is-warning is-fullwidth">{t('resetMorphAnalysis')}</button>
          </div>
          <div className="level-item">
            <button onClick={handleUpdate} className="button is-link is-fullwidth">{t('updateMorphAnalysis')}</button>
          </div>
        </div>

      </>}

    </div>
  );
}

