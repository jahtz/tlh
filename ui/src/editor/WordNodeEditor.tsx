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
import {
  isSingleMorphologicalAnalysis,
  MorphologicalAnalysis,
  readMorphAnalysis,
  writeLetteredMorphologicalAnalysisValue,
  writeSingleMorphologicalAnalysisValue
} from '../model/morphologicalAnalysis';
import {MorphAnalysisOption, Numerus} from './morphAnalysisOption/MorphologicalAnalysisOption';
import {DisplayNode} from './NodeDisplay';
import {tlhNodeDisplayConfig, WordNodeAttributes} from './tlhNodeDisplayConfig';
import {AnalysisOption} from '../model/analysisOptions';
import {useSelector} from 'react-redux';
import {editorConfigSelector} from '../store/store';
import {GenericAttributes, XmlElementNode} from './xmlModel';
import {MorphAnalysisEditor} from './morphAnalysisOption/MorphAnalysisEditor';
import {reconstructTransliteration} from './transliterationReconstruction';
import {WordContentEditor} from './WordContentEditor';

const morphologyAttributeNameRegex = /^mrp(\d+)$/;

interface IProps {
  props: XmlEditableNodeIProps<WordNodeAttributes & GenericAttributes>;
}

function readMorphologiesFromNode(node: XmlElementNode<WordNodeAttributes>): MorphologicalAnalysis[] {
  return Object.entries(node.attributes)
    .map(([name, value]) => {
      const match = name.trim().match(morphologyAttributeNameRegex);

      if (match) {
        return readMorphAnalysis(parseInt(match[1]), value);
      }
    })
    .filter((m): m is MorphologicalAnalysis => !!m);
}

interface IState {
  morphologies: MorphologicalAnalysis[];
  selectedMorphologies: SelectedAnalysisOption[];
  changed: boolean;
  addMorphology: boolean;
}

export function WordNodeEditor({props: {node, updateNode, path, jumpEditableNodes, keyHandlingEnabled, setKeyHandlingEnabled}}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const editorConfig = useSelector(editorConfigSelector);
  const [editContent, setEditContent] = useState<string>();

  const [state, setState] = useState<IState>({
    morphologies: readMorphologiesFromNode(node),
    selectedMorphologies: readSelectedMorphology(node.attributes.mrp0sel?.trim() || ''),
    changed: false,
    addMorphology: false
  });

  const handleKey = (event: KeyboardEvent) => editorConfig.submitChangeKeys.includes(event.key) && handleUpdate();

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  });

  function handleUpdate(): void {
    if (keyHandlingEnabled) {
      node.attributes.mrp0sel = writeSelectedMorphologies(state.selectedMorphologies);

      // FIXME: update morphologies!
      for (const ma of state.morphologies) {
        node.attributes[`mrp${ma.number}`] = isSingleMorphologicalAnalysis(ma) ? writeSingleMorphologicalAnalysisValue(ma) : writeLetteredMorphologicalAnalysisValue(ma).join('\n');
      }

      updateNode(node, path);

      setState((state) => ({...state, changed: false}));
    }
  }

  function updateSelected(newValue: SelectedAnalysisOption, ctrl: boolean): void {
    setState(({selectedMorphologies: currentSelection, ...rest}) => {
      const newValues = ctrl
        ? (isSelected(newValue, currentSelection)
          ? currentSelection.filter((v) => !selectedAnalysisOptionEquals(v, newValue))
          : [...currentSelection, newValue])
        : [newValue];

      return {...rest, selectedMorphologies: newValues, changed: true};
    });
  }

  function selectAll(number?: number, numerus?: Numerus): void {

    setState(({morphologies, addMorphology}) => {
      const allValues = morphologies
        .filter((morph) => !number || morph.number === number)
        .flatMap((m) =>
          isSingleMorphologicalAnalysis(m)
            ? [{num: m.number}]
            : m.analyses
              .filter(({analysis}) => !numerus || analysis.includes(numerus) || analysis.includes('ABL') || analysis.includes('INS'))
              .map(({letter}) => {
                return {num: m.number, letter};
              })
        );

      return {morphologies, selectedMorphologies: allValues.sort(compareSelectedAnalysisOptions), changed: true, addMorphology};
    });
  }

  function editWord(): void {
    const x = node.children.map(reconstructTransliteration).join('');
    console.info(x);

    setEditContent(x);
  }

  function updateMorphology(newMa: MorphologicalAnalysis): void {
    setState(({morphologies, selectedMorphologies}) => {
      morphologies[newMa.number - 1] = newMa;

      return {selectedMorphologies, morphologies, changed: true, addMorphology: false};
    });
  }

  function toggleAddMorphology(): void {
    setState(({addMorphology, ...rest}) => ({...rest, addMorphology: !addMorphology}));
  }

  function nextMorphAnalysis(): MorphologicalAnalysis {
    const number = Math.max(...state.morphologies.map(({number}) => number)) + 1;

    return {type: 'LetteredMorphologicalAnalysis', number, translation: '', transcription: '', other: [], analyses: []};
  }

  if (editContent) {
    return <WordContentEditor initialTransliteration={editContent} cancelEdit={() => setEditContent(undefined)}/>;
  }

  return (
    <div>
      <div className="box has-text-centered">
        {node.children.map((c, i) => <DisplayNode key={i} path={[]} currentSelectedPath={undefined} node={c} displayConfig={tlhNodeDisplayConfig}/>)}
      </div>

      {state.morphologies.map((m) =>
        <MorphAnalysisOption key={m.number} ma={m} selectedOption={state.selectedMorphologies} updateSelected={updateSelected}
                             updateMorphology={updateMorphology} selectAll={(numerus) => selectAll(m.number, numerus)}
                             setKeyHandlingEnabled={setKeyHandlingEnabled}/>
      )}

      {state.addMorphology && <MorphAnalysisEditor ma={nextMorphAnalysis()} update={updateMorphology} toggleUpdate={toggleAddMorphology}/>}


      <hr/>

      <div className="columns">
        <div className="column">
          <button type="button" className="button is-fullwidth" onClick={toggleAddMorphology}>{t('addMorphology')}</button>
        </div>
        <div className="column">
          <button type="button" className="button is-fullwidth" onClick={editWord}>{t('editContent')}</button>
        </div>
        <div className="column">
          <button type="button" className="button is-fullwidth" onClick={() => selectAll()}>{t('selectAllMorphologies')}</button>
        </div>
      </div>

      <div className="box has-text-centered has-background-primary has-text-left has-text-weight-bold is-size-5">
        {state.selectedMorphologies
          .sort(compareSelectedAnalysisOptions)
          .map((selectedMorph) => {
            const x: MorphologicalAnalysis = state.morphologies.find(({number}) => number === selectedMorph.num)!;

            const analysis: string | AnalysisOption | undefined = isSingleMorphologicalAnalysis(x)
              ? x.analysis
              : x.analyses.find(({letter}) => selectedMorph.letter === letter);

            return <p key={stringifySelectedAnalysisOption(selectedMorph)}>
              {stringifySelectedAnalysisOption(selectedMorph)} - &nbsp;&nbsp;&nbsp;&nbsp; {x.translation} &nbsp; {typeof analysis === 'string' ? analysis : analysis?.analysis} &nbsp; {x.other}
            </p>;
          })}
      </div>

      <div className="buttons">
        <button onClick={handleUpdate} className="button is-link is-fullwidth" disabled={!state.changed}>{t('updateMorphAnalysis')}</button>
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

