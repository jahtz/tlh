import {XmlEditableNodeIProps} from './xmlDisplayConfigs';
import {readSelectedMorphology, SelectedAnalysisOption, writeSelectedMorphologies} from './selectedAnalysisOption';
import {useTranslation} from 'react-i18next';
import {useEffect, useState} from 'react';
import {MorphologicalAnalysis, readMorphologiesFromNode, writeMorphAnalysisValue} from '../model/morphologicalAnalysis';
import {MorphAnalysisOption} from './morphAnalysisOption/MorphologicalAnalysisOption';
import {NodeDisplay} from './NodeDisplay';
import {tlhEditorConfig, WordNodeAttributes} from './tlhEditorConfig';
import {getSelectedLetters, LetteredAnalysisOption} from '../model/analysisOptions';
import {useSelector} from 'react-redux';
import {allManuscriptLanguagesSelector, editorKeyConfigSelector} from '../store/store';
import {GenericAttributes, XmlElementNode} from './xmlModel/xmlModel';
import {MorphAnalysisEditor} from './morphAnalysisOption/MorphAnalysisEditor';
import {reconstructTransliteration} from './transliterationReconstruction';
import {WordContentEditor} from './WordContentEditor';
import update from 'immutability-helper';
import {UpdatePrevNextButtons} from './morphAnalysisOption/UpdatePrevNextButtons';
import {IoAddOutline, IoSettingsOutline} from 'react-icons/io5';


type IProps = XmlEditableNodeIProps<WordNodeAttributes & GenericAttributes>;

interface IState {
  lg: string | undefined;
  morphologies: MorphologicalAnalysis[];
  changed?: boolean;
  addMorphology?: boolean;
  editContent?: string;
}

function toggleLetteredAnalysisOptions(aos: LetteredAnalysisOption[], letter: string, value?: boolean): LetteredAnalysisOption[] {
  return aos.map((ao) =>
    ao.letter === letter
      ? {...ao, selected: value === undefined ? !ao.selected : value}
      : ao
  );
}

function initialStateFromNode(node: XmlElementNode): IState {
  const initialSelectedMorphologies: SelectedAnalysisOption[] = readSelectedMorphology(node.attributes.mrp0sel?.trim() || '');

  return {
    lg: node.attributes.lg,
    morphologies: readMorphologiesFromNode(node, initialSelectedMorphologies)
  };
}

export function WordNodeEditor({
  node,
  updateNode,
  deleteNode,
  path,
  jumpEditableNodes,
  keyHandlingEnabled,
  setKeyHandlingEnabled,
  initiateJumpElement
}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const editorConfig = useSelector(editorKeyConfigSelector);
  const allManuscriptLanguages = useSelector(allManuscriptLanguagesSelector);
  const [state, setState] = useState<IState>(initialStateFromNode(node));

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  });

  function handleKey(event: KeyboardEvent) {
    if (editorConfig.submitChangeKeys.includes(event.key)) {
      handleUpdate();
    }
  }

  function handleUpdate(): void {
    if (keyHandlingEnabled) {
      const newNode = {...node};

      newNode.attributes.lg = state.lg;

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

      newNode.attributes.mrp0sel = selectedAnalysisOptions.length > 0
        ? writeSelectedMorphologies(selectedAnalysisOptions)
        : ' ';

      for (const ma of state.morphologies) {
        newNode.attributes[`mrp${ma.number}`] = writeMorphAnalysisValue(ma);
      }

      updateNode(newNode, path);

      setState((state) => update(state, {changed: {$set: false}}));
    }
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

  function enableEditWordState(): void {
    setState((state) => update(state, {
      editContent: {
        $set: node.children.map((c, index) => reconstructTransliteration(c, index === 0)).join('')
      }
    }));
  }

  function handleEditUpdate(node: XmlElementNode<WordNodeAttributes & GenericAttributes>): void {
    updateNode(node, path);
    // FIXME: reload morphological analysis!
    cancelEdit();
  }

  function cancelEdit(): void {
    setState((state) => update(state, {editContent: {$set: undefined}}));
  }

  function updateMorphology(index: number, newMa: MorphologicalAnalysis): void {
    console.info(index);
    console.info(JSON.stringify(newMa, null, 2));

    setState((state) => {
      const newState = update(state, {
        morphologies: {[index]: {$set: newMa}},
        changed: {$set: true},
        addMorphology: {$set: false}
      });

      console.info(JSON.stringify(newState.morphologies, null, 2));

      return newState;
    });
  }

  console.info(JSON.stringify(state.morphologies, null, 2));

  function toggleAddMorphology(): void {
    setState((state) => update(state, {$toggle: ['addMorphology']}));
  }

  function nextMorphAnalysis(): MorphologicalAnalysis {
    const number = Math.max(0, ...state.morphologies.map(({number}) => number)) + 1;

    return {number, translation: '', referenceWord: '', analysisOptions: [], paradigmClass: ''};
  }


  function updateLanguage(value: string): void {
    const lg = value.trim();
    setState((state) => update(state, {lg: {$set: lg}, changed: {$set: true}}));
  }

  if (state.editContent || typeof state.editContent === 'string') {
    return <WordContentEditor initialTransliteration={state.editContent} cancelEdit={cancelEdit} updateNode={handleEditUpdate}/>;
  }

  return (
    <>
      <div className="box has-text-centered">
        <NodeDisplay node={node} editorConfig={tlhEditorConfig}/>
        <sup>&nbsp;</sup><sub>&nbsp;</sub>
      </div>

      <div className="box scrollable">

        {/* TODO: edit language... */}
        <div className="field">
          <div className="control">
            <input defaultValue={node.attributes.lg} className="input" placeholder={t('language')} list="languages"
                   onBlur={(event) => updateLanguage(event.target.value)}/>
          </div>

          <datalist id="languages">
            {allManuscriptLanguages.map(({abbreviation}) => <option key={abbreviation}>{abbreviation}</option>)}
          </datalist>
        </div>

        {state.morphologies.length === 0
          ? <div className="notification is-warning has-text-centered">{t('noMorphologicalAnalysesFound')}</div>
          : state.morphologies.map((m, index) => <MorphAnalysisOption
            key={m.number}
            changed={state.changed || false}
            morphologicalAnalysis={m}
            toggleAnalysisSelection={(letter) => toggleAnalysisSelection(m.number, letter)}
            toggleEncliticsSelection={(letter) => toggleEncliticsSelection(m.number, letter)}
            updateMorphology={(newMa) => updateMorphology(index, newMa)}
            setKeyHandlingEnabled={setKeyHandlingEnabled}
            initiateUpdate={handleUpdate}
            initiateJumpElement={initiateJumpElement}/>
          )}

        {state.addMorphology && <MorphAnalysisEditor ma={nextMorphAnalysis()} update={(newMa) => updateMorphology(state.morphologies.length, newMa)}
                                                     toggleUpdate={toggleAddMorphology}/>}
      </div>

      <div className="columns mt-2">
        <div className="column">
          <button type="button" className="button is-fullwidth" onClick={toggleAddMorphology}><IoAddOutline/>&nbsp;{t('addMorphology')}</button>
        </div>
        <div className="column">
          <button onClick={deleteNode} className="button is-danger is-fullwidth">{t('deleteNode')}</button>
        </div>
        <div className="column">
          <button type="button" className="button is-fullwidth" onClick={enableEditWordState}><IoSettingsOutline/>&nbsp;{t('editContent')}</button>
        </div>
      </div>

      <UpdatePrevNextButtons changed={state.changed || false} initiateUpdate={handleUpdate}
                             initiateJumpElement={(forward) => jumpEditableNodes(node.tagName, forward)}/>
    </>
  );
}
