import {MorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import React, {useEffect, useState} from 'react';
import {MorphAnalysisOptionButtons} from './MorphAnalysisButtons';
import {MorphAnalysisEditor} from './MorphAnalysisEditor';

interface IProps {
  morphologicalAnalysis: MorphologicalAnalysis;

  toggleOrSetAnalysisSelection: (letter?: string, value?: boolean) => void;
  toggleEncliticsSelection: (letter: string) => void;

  setKeyHandlingEnabled: (b: boolean) => void;
  updateMorphology: (newMa: MorphologicalAnalysis) => void;
}

export enum Numerus {
  Singular = 'SG', Plural = 'PL'
}

export function MorphAnalysisOption(iProps: IProps): JSX.Element {

  const {morphologicalAnalysis, updateMorphology, setKeyHandlingEnabled, toggleOrSetAnalysisSelection, toggleEncliticsSelection} = iProps;

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
      {update
        ? <MorphAnalysisEditor ma={morphologicalAnalysis} update={innerUpdateMorphology} toggleUpdate={toggleUpdate}/>
        : <>
          <MorphAnalysisOptionButtons
            morphologicalAnalysis={morphologicalAnalysis}
            toggleOrSetAnalysisSelection={toggleOrSetAnalysisSelection}
            toggleEncliticsSelection={toggleEncliticsSelection}
            toggleUpdate={toggleUpdate}/>
        </>
      }
    </div>
  );
}
