import {useTranslation} from "react-i18next";
import React, {useState} from "react";
import {WordComponent} from "../manuscript/TransliterationLineResult";
import {MorphAnalysisOption} from "./MorphologicalAnalysisOption";
import {EditedWord} from "./DocumentEditor";
import {AnalysisOption} from "../model/morphologicalAnalysis";
import {
  isSelected,
  morphSplitCharacter,
  readSelectedMorphology,
  SelectedAnalysisOption,
  selectedAnalysisOptionEquals,
  stringifySelectedAnalysisOption
} from "./selectedAnalysisOption";


interface WordEditorIProps {
  w: EditedWord;
  update: (morph: string, paragraphId: number, wordId: number) => void;
  previousWord: () => void;
  nextWord: () => void;
}


export function WordEditor({w: {word, paragraphIndex, wordIndex}, update, previousWord, nextWord}: WordEditorIProps): JSX.Element {

  const initialMorphology = word.mrp0sel ? readSelectedMorphology(word.mrp0sel) : [];

  const {t} = useTranslation('common');
  const [selectedMorphologies, setSelectedMorphology] = useState<SelectedAnalysisOption[]>(initialMorphology);

  function resetMorphAnalysis(): void {
    setSelectedMorphology(initialMorphology);
  }

  function handleUpdate(): void {
    const newValue = selectedMorphologies
      .map(stringifySelectedAnalysisOption)
      .join(morphSplitCharacter);

    update(newValue, paragraphIndex, wordIndex);
  }

  function updateSelected(newValue: SelectedAnalysisOption, ctrl: boolean): void {
    if (!ctrl) {
      setSelectedMorphology([newValue]);
    } else {
      setSelectedMorphology((currentSelection) => isSelected(newValue, currentSelection)
        ? currentSelection.filter((v) => !selectedAnalysisOptionEquals(v, newValue))
        : [...currentSelection, newValue]);
    }
  }

  function getMorphologicalAnalysisOption(identifier: SelectedAnalysisOption): string | AnalysisOption {
    if (!word.morphologies) {
      return '';
    }

    const morphAnalysis = word.morphologies.find(({number}) => number === identifier.num)!!;

    if (typeof morphAnalysis.analyses === 'string') {
      return morphAnalysis.analyses;
    }

    return morphAnalysis.analyses.find(({letter}) => identifier.letter === letter)!!;
  }

  return (
    <div>
      <div className="box has-text-centered">
        <WordComponent word={word}/>
      </div>

      {word.language && <p><b>{t('language')}:</b> {word.language}</p>}

      {word.morphologies && word.morphologies.map((m, index) =>
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

        {/*selectedMorphologies !== initialMorphology  TODO: does not work anymore...  && */
          <div className="level">
            <div className="level-item">
              <button onClick={resetMorphAnalysis} className="button is-warning is-fullwidth">{t('resetMorphAnalysis')}</button>
            </div>
            <div className="level-item">
              <button onClick={handleUpdate} className="button is-link is-fullwidth">{t('updateMorphAnalysis')}</button>
            </div>
          </div>
        }

      </>}

      <div className="box level">
        <div className="level-item">
          <button onClick={previousWord} className="button is-fullwidth">{t('previousWord')}</button>
        </div>
        <div className="level-item">
          <button onClick={nextWord} className="button is-fullwidth">{t('nextWord')}</button>
        </div>
      </div>
    </div>
  );
}
