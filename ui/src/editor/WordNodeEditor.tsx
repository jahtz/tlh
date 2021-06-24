import {XmlEditableNodeIProps} from './xmlDisplayConfigs';
import {
  compareSelectedAnalysisOptions,
  isSelected,
  readSelectedMorphology,
  SelectedAnalysisOption,
  selectedAnalysisOptionEquals,
  stringifySelectedAnalysisOption,
  writeSelectedMorphologies
} from './selectedAnalysisOption';
import {useTranslation} from 'react-i18next';
import React, {useEffect, useState} from 'react';
import {isSingleMorphologicalAnalysis, MorphologicalAnalysis, readMorphAnalysis} from '../model/morphologicalAnalysis';
import {MorphAnalysisOption} from './MorphologicalAnalysisOption';
import {DisplayNode} from './NodeDisplay';
import {tlhNodeDisplayConfig, WordNodeAttributes} from './tlhNodeDisplayConfig';
import {AnalysisOption} from '../model/analysisOptions';

const morphologyAttributeNameRegex = /^mrp(\d+)$/;

interface IProps {
  props: XmlEditableNodeIProps<WordNodeAttributes>;
}

export function WordNodeEditor({props: {node, updateNode, path, jumpEditableNodes}}: IProps): JSX.Element {

  const initialSelectedMorphologies: SelectedAnalysisOption[] = readSelectedMorphology(node.attributes.mrp0sel?.trim() || '')
    .sort(compareSelectedAnalysisOptions);

  const {t} = useTranslation('common');
  const [selectedMorphologies, setSelectedMorphologies] = useState<SelectedAnalysisOption[]>(initialSelectedMorphologies);

  const handleKey = (event: KeyboardEvent) => event.key === 'Enter' && handleUpdate();

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  });

  const morphologies: MorphologicalAnalysis[] = Object.entries(node.attributes)
    .map(([name, value]) => {
      const match = name.trim().match(morphologyAttributeNameRegex);

      if (match) {
        return readMorphAnalysis(parseInt(match[1]), value);
      }
    })
    .filter((m): m is MorphologicalAnalysis => !!m);

  function handleUpdate(): void {
    node.attributes.mrp0sel = writeSelectedMorphologies(selectedMorphologies);
    updateNode(node, path);
  }

  function updateSelected(newValue: SelectedAnalysisOption, ctrl: boolean): void {
    setSelectedMorphologies((currentSelection) => {
      const newValues = ctrl
        ? (isSelected(newValue, currentSelection)
          ? currentSelection.filter((v) => !selectedAnalysisOptionEquals(v, newValue))
          : [...currentSelection, newValue])
        : [newValue];

      return newValues.sort(compareSelectedAnalysisOptions);
    });
  }

  function selectAll(): void {
    const allValues = morphologies.flatMap((m) => {
      const num = m.number;

      return isSingleMorphologicalAnalysis(m)
        ? [{num}]
        : m.analyses.map(({letter}) => {
          return {num, letter};
        });
    });

    setSelectedMorphologies(allValues.sort(compareSelectedAnalysisOptions));
  }

  // works only if initialSelectedMorphologies and selectedMorphologies are sorted!
  const morphologiesChanged = initialSelectedMorphologies.length !== selectedMorphologies.length || initialSelectedMorphologies.some((im, index) => !selectedAnalysisOptionEquals(im, selectedMorphologies[index]));

  return (
    <div>
      <div className="box has-text-centered">
        {node.children.map((c, i) => <DisplayNode key={i} path={[]} currentSelectedPath={undefined} node={c} displayConfig={tlhNodeDisplayConfig}/>)}
      </div>

      {morphologies.map((m, index) =>
        <MorphAnalysisOption key={index} ma={m} selectedOption={selectedMorphologies} updateSelected={updateSelected}/>
      )}

      <hr/>

      <div className="columns">
        <div className="column">
          <button type="button" className="button is-fullwidth" disabled>{t('editContent')}</button>
        </div>
        <div className="column">
          <button type="button" className="button is-fullwidth" onClick={selectAll}>{t('selectAllMorphologies')}</button>
        </div>
      </div>

      <div className="box has-text-centered has-background-primary has-text-left has-text-weight-bold is-size-5">
        {selectedMorphologies.sort(compareSelectedAnalysisOptions).map((selectedMorph) => {
          const x: MorphologicalAnalysis = morphologies.find(({number}) => number === selectedMorph.num)!;

          const analysis: string | AnalysisOption | undefined = isSingleMorphologicalAnalysis(x)
            ? x.analysis
            : x.analyses.find(({letter}) => selectedMorph.letter === letter);

          return <p key={stringifySelectedAnalysisOption(selectedMorph)}>
            {stringifySelectedAnalysisOption(selectedMorph)} - &nbsp;&nbsp;&nbsp;&nbsp; {x.translation} &nbsp; {typeof analysis === 'string' ? analysis : analysis?.analysis} &nbsp; {x.other}
          </p>;
        })}
      </div>

      <div className="buttons">
        {/* FIXME: disable if not changed! */}
        <button onClick={handleUpdate} className="button is-link is-fullwidth" disabled={!morphologiesChanged}>{t('updateMorphAnalysis')}</button>
      </div>

      <div className="columns">
        <div className="column">
          <button className="button is-fullwidth" onClick={() => jumpEditableNodes(node.tagName, false)}>{t('previousEditable')}</button>
        </div>
        <div className="column">
          <button className="button is-fullwidth" onClick={() => jumpEditableNodes(node.tagName, true)}>{t('nextEditable')}</button>
        </div>
      </div>

    </div>
  );
}

