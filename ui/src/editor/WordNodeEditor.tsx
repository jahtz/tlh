import {XmlEditableNodeIProps} from './xmlDisplayConfigs';
import {readSelectedMorphology, SelectedAnalysisOption, writeSelectedMorphologies} from './selectedAnalysisOption';
import {useTranslation} from 'react-i18next';
import React, {Fragment, useEffect, useState} from 'react';
import {MorphologicalAnalysis, readMorphologiesFromNode, writeMorphAnalysisValue} from '../model/morphologicalAnalysis';
import {MorphAnalysisOption, Numerus} from './morphAnalysisOption/MorphologicalAnalysisOption';
import {DisplayNode} from './NodeDisplay';
import {tlhNodeDisplayConfig, WordNodeAttributes} from './tlhNodeDisplayConfig';
import {getSelectedLetters, LetteredAnalysisOption} from '../model/analysisOptions';
import {useSelector} from 'react-redux';
import {editorConfigSelector} from '../store/store';
import {GenericAttributes, XmlElementNode} from './xmlModel/xmlModel';
import {MorphAnalysisEditor} from './morphAnalysisOption/MorphAnalysisEditor';
import {reconstructTransliteration} from './transliterationReconstruction';
import {WordContentEditor} from './WordContentEditor';
import {SelectedAnalysisResult} from './SelectedAnalysisResult';

export const morphologyAttributeNameRegex = /^mrp(\d+)$/;

interface IProps {
  props: XmlEditableNodeIProps<WordNodeAttributes & GenericAttributes>;
}

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

export function WordNodeEditor({props: {node, updateNode, path, jumpEditableNodes, keyHandlingEnabled, setKeyHandlingEnabled}}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const editorConfig = useSelector(editorConfigSelector);
  const [editContent, setEditContent] = useState<string>();

  const initialSelectedMorphologies = readSelectedMorphology(node.attributes.mrp0sel?.trim() || '');

  // FIXME: set initially selected morphologies!

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

      setState((state) => ({...state, changed: false}));
    }
  }

  function handleEditUpdate(node: XmlElementNode<WordNodeAttributes & GenericAttributes>): void {
    updateNode(node, path);
    // FIXME: reload morphological analysis!
    setEditContent(undefined);
  }

  function toggleOrSetAnalysisSelection(number: number, letter?: string, value?: boolean): void {
    setState(({morphologies: oldMorphologies, ...rest}) => {
      const morphologies = oldMorphologies.map((m) => {
        if (number !== m.number) {
          return m;
        }

        if ('analysis' in m) {
          return !letter
            ? {...m, selected: value === undefined ? !m.selected : value}
            : m /* error! */;
        } else {
          return letter
            ? {...m, analysisOptions: toggleLetteredAnalysisOptions(m.analysisOptions, letter, value)}
            : m; /* error! */
        }
      });

      return {...rest, changed: true, morphologies};
    });
  }

  function toggleEncliticsSelection(number: number, letter: string): void {
    setState(({morphologies: oldMorphologies, ...rest}) => {
      const morphologies = oldMorphologies.map((m) => {
        if (number !== m.number) {
          return m;
        }

        const encliticsAnalysis = m.encliticsAnalysis && ('analysisOptions' in m.encliticsAnalysis)
          ? {...m.encliticsAnalysis, analysisOptions: toggleLetteredAnalysisOptions(m.encliticsAnalysis.analysisOptions, letter)}
          : m.encliticsAnalysis;

        return {...m, encliticsAnalysis};
      });

      return {...rest, changed: true, morphologies};
    });
  }

  function editWord(): void {
    const transliteration = node.children.map((c, index) => reconstructTransliteration(c, index === 0)).join('');

    setEditContent(transliteration);
  }

  function updateMorphology(newMa: MorphologicalAnalysis): void {
    setState(({morphologies}) => {
      morphologies[newMa.number - 1] = newMa;

      return {morphologies, changed: true, addMorphology: false};
    });
  }

  function toggleAddMorphology(): void {
    setState(({addMorphology, ...rest}) => ({...rest, addMorphology: !addMorphology}));
  }

  function nextMorphAnalysis(): MorphologicalAnalysis {
    const number = Math.max(...state.morphologies.map(({number}) => number)) + 1;

    return {number, translation: '', referenceWord: '', analysisOptions: [], paradigmClass: ''};
  }

  if (editContent) {
    return <WordContentEditor initialTransliteration={editContent} cancelEdit={() => setEditContent(undefined)} updateNode={handleEditUpdate}/>;
  }

  return (
    <div>
      <div className="box has-text-centered">
        {node.children.map((c, i) => <DisplayNode key={i} path={[]} currentSelectedPath={undefined} node={c} displayConfig={tlhNodeDisplayConfig}/>)}
      </div>

      {state.morphologies.length === 0
        ? <div className="notification is-warning has-text-centered">{t('noMorphologicalAnalysesFound')}</div>
        : state.morphologies.map((m) => <Fragment key={m.number}>
            <MorphAnalysisOption
              morphologicalAnalysis={m}
              toggleOrSetAnalysisSelection={(letter, value) => toggleOrSetAnalysisSelection(m.number, letter, value)}
              toggleEncliticsSelection={(letter) => toggleEncliticsSelection(m.number, letter)}
              updateMorphology={updateMorphology}
              setKeyHandlingEnabled={setKeyHandlingEnabled}/>
          </Fragment>
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
      </div>

      <div className="message is-primary has-text-weight-bold">
        <div className="message-body">
          <table className="table is-fullwidth">
            <tbody>
              {state.morphologies.map((ma) => <SelectedAnalysisResult key={ma.number} ma={ma}/>)}
            </tbody>
          </table>
        </div>
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

