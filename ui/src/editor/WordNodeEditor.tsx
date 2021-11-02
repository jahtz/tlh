import {XmlEditableNodeIProps} from './xmlDisplayConfigs';
import {readSelectedMorphology, SelectedAnalysisOption, writeSelectedMorphologies} from './selectedAnalysisOption';
import {useTranslation} from 'react-i18next';
import React, {Fragment, useEffect, useState} from 'react';
import {MorphologicalAnalysis, readMorphologiesFromNode, writeMorphAnalysisValue} from '../model/morphologicalAnalysis';
import {MorphAnalysisOption, Numerus} from './morphAnalysisOption/MorphologicalAnalysisOption';
import {NodeDisplay} from './NodeDisplay';
import {tlhNodeDisplayConfig, WordNodeAttributes} from './tlhNodeDisplayConfig';
import {getSelectedLetters, LetteredAnalysisOption} from '../model/analysisOptions';
import {useSelector} from 'react-redux';
import {editorConfigSelector} from '../store/store';
import {GenericAttributes, XmlElementNode} from './xmlModel/xmlModel';
import {MorphAnalysisEditor} from './morphAnalysisOption/MorphAnalysisEditor';
import {reconstructTransliteration} from './transliterationReconstruction';
import {WordContentEditor} from './WordContentEditor';
import update from 'immutability-helper';
import {UpdatePrevNextButtons} from './morphAnalysisOption/UpdatePrevNextButtons';
import {IoAddOutline, IoSettingsOutline} from 'react-icons/io5';


type IProps = XmlEditableNodeIProps<WordNodeAttributes & GenericAttributes>;

interface IState {
  morphologies: MorphologicalAnalysis[];
  changed: boolean;
  addMorphology: boolean;
}

function toggleLetteredAnalysisOptions(aos: LetteredAnalysisOption[], letter: string, value?: boolean): LetteredAnalysisOption[] {
  return aos.map((ao) =>
    ao.letter === letter
      ? {...ao, selected: value === undefined ? !ao.selected : value}
      : ao
  );
}

export function analysisIsInNumerus(analysis: string, numerus: Numerus): boolean {
  return analysis.includes(numerus) || analysis.includes('ABL') || analysis.includes('INS');
}

export function WordNodeEditor(
  {node, updateNode, deleteNode, path, jumpEditableNodes, keyHandlingEnabled, setKeyHandlingEnabled, initiateJumpElement}: IProps
): JSX.Element {

  const {t} = useTranslation('common');
  const editorConfig = useSelector(editorConfigSelector);
  const [editContent, setEditContent] = useState<string>();

  const initialSelectedMorphologies = readSelectedMorphology(node.attributes.mrp0sel?.trim() || '');

  const [state, setState] = useState<IState>({
    morphologies: readMorphologiesFromNode(node, initialSelectedMorphologies), changed: false, addMorphology: false
  });

  const handleKey = (event: KeyboardEvent) => editorConfig.submitChangeKeys.includes(event.key) && handleUpdate();

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  });

  function handleUpdate(): void {
    if (keyHandlingEnabled) {
      const newNode = {...node};

      const selectedAnalysisOptions: SelectedAnalysisOption[] = state.morphologies.flatMap((ma) => {

        const enclitics = ma.encliticsAnalysis
          ? 'analysis' in ma.encliticsAnalysis ? undefined : getSelectedLetters(ma.encliticsAnalysis.analysisOptions)
          : undefined;

        if ('analysisOptions' in ma) {
          return getSelectedLetters(ma.analysisOptions).map((letter) => ({number: ma.number, letter, enclitics}));
        } else if (ma.selected) {
          return [{number: ma.number, enclitics}];
        } else {
          return [];
        }
      });

      newNode.attributes.mrp0sel = writeSelectedMorphologies(selectedAnalysisOptions);

      for (const ma of state.morphologies) {
        newNode.attributes[`mrp${ma.number}`] = writeMorphAnalysisValue(ma);
      }

      updateNode(newNode, path);

      setState((state) => update(state, {changed: {$set: false}}));
    }
  }

  function handleEditUpdate(node: XmlElementNode<WordNodeAttributes & GenericAttributes>): void {
    updateNode(node, path);
    // FIXME: reload morphological analysis!
    setEditContent(undefined);
  }

  function toggleAnalysisSelection(number: number, letter?: string): void {
    setState((state) => update(state, {
        morphologies: {
          $apply: (oldMorphologies: MorphologicalAnalysis[]) => oldMorphologies.map((m) => {
            if (number !== m.number) {
              return m;
            }

            if ('analysis' in m) {
              return !letter
                ? {...m, selected: !m.selected}
                : m /* error! */;
            } else {
              return letter
                ? {...m, analysisOptions: toggleLetteredAnalysisOptions(m.analysisOptions, letter)}
                : m; /* error! */
            }

          })
        },
        changed: {$set: true}
      }
    ));
  }

  function toggleEncliticsSelection(number: number, letter: string): void {
    setState((state) => update(state, {
      morphologies: {
        $apply: (oldMorphologies: MorphologicalAnalysis[]) => oldMorphologies.map((m) => {
          if (number !== m.number) {
            return m;
          }

          const encliticsAnalysis = m.encliticsAnalysis && ('analysisOptions' in m.encliticsAnalysis)
            ? {...m.encliticsAnalysis, analysisOptions: toggleLetteredAnalysisOptions(m.encliticsAnalysis.analysisOptions, letter)}
            : m.encliticsAnalysis;

          return {...m, encliticsAnalysis};
        })
      },
      changed: {$set: true}
    }));
  }

  function editWord(): void {
    const transliteration = node.children.map((c, index) => reconstructTransliteration(c, index === 0)).join('');

    setEditContent(transliteration);
  }

  function updateMorphology(newMa: MorphologicalAnalysis): void {
    // FIXME: check if always working, use update synctax!!
    setState(({morphologies}) => {
      morphologies[newMa.number - 1] = newMa;

      return {morphologies, changed: true, addMorphology: false};
    });
  }

  function toggleAddMorphology(): void {
    setState((state) => update(state, {$toggle: ['addMorphology']}));
    // setState(({addMorphology, ...rest}) => ({...rest, addMorphology: !addMorphology}));
  }

  function nextMorphAnalysis(): MorphologicalAnalysis {
    const number = Math.max(0, ...state.morphologies.map(({number}) => number)) + 1;

    return {number, translation: '', referenceWord: '', analysisOptions: [], paradigmClass: ''};
  }

  if (editContent) {
    return <WordContentEditor initialTransliteration={editContent} cancelEdit={() => setEditContent(undefined)} updateNode={handleEditUpdate}/>;
  }

  return (
    <>
      <div className="box has-text-centered">
        {node.children.map((c, i) => <NodeDisplay key={i} currentSelectedPath={undefined} node={c} displayConfig={tlhNodeDisplayConfig}/>)}
      </div>

      <div className="scrollable">
        {state.morphologies.length === 0
          ? <div className="notification is-warning has-text-centered">{t('noMorphologicalAnalysesFound')}</div>
          : state.morphologies.map((m) => <Fragment key={m.number}>
              <MorphAnalysisOption
                changed={state.changed}
                morphologicalAnalysis={m}
                toggleAnalysisSelection={(letter) => toggleAnalysisSelection(m.number, letter)}
                toggleEncliticsSelection={(letter) => toggleEncliticsSelection(m.number, letter)}
                updateMorphology={updateMorphology}
                setKeyHandlingEnabled={setKeyHandlingEnabled}
                initateUpdate={handleUpdate}
                initiateJumpElement={initiateJumpElement}/>
            </Fragment>
          )}

        {state.addMorphology && <MorphAnalysisEditor ma={nextMorphAnalysis()} update={updateMorphology} toggleUpdate={toggleAddMorphology}/>}
      </div>

      <div className="field has-addons mt-2">
        <div className="control is-expanded">
          <button type="button" className="button is-fullwidth" onClick={toggleAddMorphology}><IoAddOutline/>&nbsp;{t('addMorphology')}</button>
        </div>
        <div className="control is-expanded">
          <button type="button" className="button is-fullwidth" onClick={editWord}><IoSettingsOutline/>&nbsp;{t('editContent')}</button>
        </div>
      </div>

      <div className="my-1">
        <button onClick={deleteNode} className="button is-danger is-fullwidth">{t('deleteNode')}</button>
      </div>

      <UpdatePrevNextButtons changed={state.changed} initiateUpdate={handleUpdate} initiateJumpElement={(forward) => jumpEditableNodes(node.tagName, forward)}/>
    </>
  );
}

