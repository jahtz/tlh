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
import {MorphAnalysisOption} from './MorphologicalAnalysisOption';
import {DisplayNode} from './NodeDisplay';
import {tlhNodeDisplayConfig, WordNodeAttributes} from './tlhNodeDisplayConfig';

const morphologyAttributeNameRegex = /^mrp(\d+)$/;

interface IProps {
  props: XmlEditableNodeIProps<WordNodeAttributes>;
}

export function WordNodeEditor({props: {node, updateNode, path, jumpEditableNodes}}: IProps): JSX.Element {

  const initialSelectedMorphologies: SelectedAnalysisOption[] = readSelectedMorphology(node.attributes.mrp0sel?.trim() || '');

  const {t} = useTranslation('common');
  const [selectedMorphologies, setSelectedMorphologies] = useState<SelectedAnalysisOption[]>(initialSelectedMorphologies);

  const morphologies: MorphologicalAnalysis[] = Object.entries(node.attributes)
    .map(([name, value]) => {
      const match = name.trim().match(morphologyAttributeNameRegex);

      if (match) {
        return readMorphAnalysis(parseInt(match[1]), value);
      }
    })
    .filter((m): m is MorphologicalAnalysis => !!m);


  function getMorphologicalAnalysisOption(identifier: SelectedAnalysisOption): string | AnalysisOption | undefined {
    const morphAnalysis: MorphologicalAnalysis = morphologies.find(({number}) => number === identifier.num)!!;

    return typeof morphAnalysis.analyses === 'string'
      ? morphAnalysis.analyses
      : morphAnalysis.analyses.find(({letter}) => identifier.letter === letter);
  }

  function resetMorphAnalysis(): void {
    setSelectedMorphologies(initialSelectedMorphologies);
  }

  function handleUpdate(): void {
    node.attributes.mrp0sel = selectedMorphologies.map(stringifySelectedAnalysisOption).join(morphSplitCharacter);
    updateNode(node, path);
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
      <div className="box has-text-centered">
        {node.children.map((c, i) => <DisplayNode key={i} path={[]} currentSelectedPath={undefined} node={c} displayConfig={tlhNodeDisplayConfig}/>)}
      </div>

      {morphologies.map((m, index) =>
        <MorphAnalysisOption key={index} ma={m} selectedOption={selectedMorphologies} updateSelected={updateSelected}/>
      )}

      {selectedMorphologies && <>
        <hr/>

        <div className="box has-text-centered has-background-primary has-text-left has-text-weight-bold is-size-5">
          {/*TODO: show selected morphologies!*/}
          {selectedMorphologies
            .sort((sm1, sm2) => {
              const n1 = sm1.num * 1000 + (sm1.letter?.charCodeAt(0) || 0);
              const n2 = sm2.num * 1000 + (sm2.letter?.charCodeAt(0) || 0);
              return n1 - n2;
            })
            .map((selectedMorph) => {

              const x: MorphologicalAnalysis = morphologies.find(({number}) => number === selectedMorph.num)!!;

              const analysis: string | AnalysisOption | undefined = getMorphologicalAnalysisOption(selectedMorph);

              return <p key={stringifySelectedAnalysisOption(selectedMorph)}>
                {stringifySelectedAnalysisOption(selectedMorph)} - &nbsp;&nbsp;&nbsp;&nbsp; {x.translation} &nbsp; {typeof analysis === 'string' ? analysis : analysis?.analysis} &nbsp; {x.other}
              </p>;
            })}
        </div>

        <div className="columns">
          <div className="column">
            <button onClick={resetMorphAnalysis} className="button is-warning is-fullwidth">{t('resetMorphAnalysis')}</button>
          </div>
          <div className="column">
            <button onClick={handleUpdate} className="button is-link is-fullwidth">{t('updateMorphAnalysis')}</button>
          </div>
        </div>

        <div className="columns">
          <div className="column">
            <button className="button is-fullwidth" onClick={() => jumpEditableNodes(node.tagName, false)}>{t('previousEditable')}</button>
          </div>
          <div className="column">
            <button className="button is-fullwidth" onClick={() => jumpEditableNodes(node.tagName, true)}>{t('nextEditable')}</button>
          </div>
        </div>

      </>}

    </div>
  );
}

