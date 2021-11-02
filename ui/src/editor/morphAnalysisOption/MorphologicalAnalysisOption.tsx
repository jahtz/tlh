import {MorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import React, {useEffect, useState} from 'react';
import {MorphAnalysisOptionButtons} from './MorphAnalysisButtons';
import {MorphAnalysisEditor} from './MorphAnalysisEditor';

interface IProps {
  changed: boolean;
  morphologicalAnalysis: MorphologicalAnalysis;

  toggleAnalysisSelection: (letter?: string) => void;
  toggleEncliticsSelection: (letter: string) => void;

  setKeyHandlingEnabled: (b: boolean) => void;
  updateMorphology: (newMa: MorphologicalAnalysis) => void;

  initateUpdate: () => void;
  initiateJumpElement: (forward: boolean) => void;
}

export enum Numerus {
  Singular = 'SG', Plural = 'PL'
}

export function MorphAnalysisOption(iProps: IProps): JSX.Element {

  const {
    changed,
    morphologicalAnalysis,
    updateMorphology,
    setKeyHandlingEnabled,
    toggleAnalysisSelection,
    toggleEncliticsSelection,
    initateUpdate,
    initiateJumpElement
  } = iProps;

  const [update, setIsUpdate] = useState(false);

  function initiateUpdate(): void {
    setKeyHandlingEnabled(update);
    setIsUpdate(!update);
  }

  useEffect(() => {
    // Enable key handling again after unmounting this component!
    return () => update ? setKeyHandlingEnabled(true) : void 0;
  });

  function innerUpdateMorphology(newMa: MorphologicalAnalysis): void {
    initiateUpdate();
    updateMorphology(newMa);
  }

  return update
    ? <MorphAnalysisEditor ma={morphologicalAnalysis} update={innerUpdateMorphology} toggleUpdate={initiateUpdate}/>
    : <MorphAnalysisOptionButtons
      changed={changed}
      morphologicalAnalysis={morphologicalAnalysis}
      toggleAnalysisSelection={toggleAnalysisSelection}
      toggleEncliticsSelection={toggleEncliticsSelection}
      initiateUpdate={initateUpdate}
      initiateJumpElement={initiateJumpElement}/>;
}
