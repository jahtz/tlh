import {isSingleMorphologicalAnalysis, MorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import React, {useEffect, useState} from 'react';
import {SelectedAnalysisOption} from '../selectedAnalysisOption';
import {IoSettingsOutline} from 'react-icons/io5';
import {MorphAnalysisOptionButtons} from './MorphAnalysisButtons';
import {MorphAnalysisEditor} from './MorphAnalysisEditor';

export interface MorphAnalysisOptionIProps {
  ma: MorphologicalAnalysis;
  selectedOption: SelectedAnalysisOption[];
  updateSelected: (s: SelectedAnalysisOption, ctrl: boolean) => void;
  selectAll: (numerus?: Numerus) => void;
}

interface IProps extends MorphAnalysisOptionIProps {
  setKeyHandlingEnabled: (b: boolean) => void;
  updateMorphology: (newMa: MorphologicalAnalysis) => void;
}

export enum Numerus {
  Singular = 'SG', Plural = 'PL'
}

export function MorphAnalysisOption({ma, selectedOption, updateSelected, selectAll, updateMorphology, setKeyHandlingEnabled}: IProps): JSX.Element {

  const {number, translation, transcription} = ma;

  const [update, setIsUpdate] = useState(false);

  function toggleUpdate(): void {
    setKeyHandlingEnabled(update);
    setIsUpdate(!update);
  }

  useEffect(() => {
    // Enable key handling again after unmounting this component!
    return () => update ? setKeyHandlingEnabled(true) : void 0;
  });

  function innerUpdateMorphology(newMa: MorphologicalAnalysis): void {
    toggleUpdate();
    updateMorphology(newMa);
  }

  return (
    <div className="my-3">
      <h2 className="subtitle is-5">
        {number}) {translation} ({transcription})&nbsp;
        {!isSingleMorphologicalAnalysis(ma) && <button className="button" onClick={toggleUpdate}><IoSettingsOutline/></button>}
      </h2>

      {update
        ? <MorphAnalysisEditor ma={ma} update={innerUpdateMorphology}/>
        : <MorphAnalysisOptionButtons ma={ma} selectedOption={selectedOption} updateSelected={updateSelected} selectAll={selectAll}/>}
    </div>
  );
}
