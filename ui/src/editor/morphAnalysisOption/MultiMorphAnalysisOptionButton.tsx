import React from 'react';
import {MultiMorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import {LetteredAnalysisOptionButton} from './LetteredAnalysisOptionButton';
import {getSelectedEnclitics} from '../SelectedAnalysisResult';
import {LetteredAnalysisOption} from '../../model/analysisOptions';

interface IProps {
  analysisOptions: LetteredAnalysisOption[];
  toggleAnalysisSelection: (letter: string) => void;
}

export function MultiMorphAnalysisSelection({ma}: { ma: MultiMorphologicalAnalysis }): JSX.Element | null {

  const selectedAnalyses = ma.analysisOptions
    .filter(({selected}) => selected);

  if (selectedAnalyses.length === 0) {
    return null;
  }

  const encliticsLetters = getSelectedEnclitics(ma);

  return (
    <table className="table is-fullwidth has-background-primary-light">
      <tbody>
        {selectedAnalyses
          .map((ao) => <tr key={ao.letter}>
            <td>{ma.number}{ao.letter}{encliticsLetters}</td>
            <td>{ma.translation}</td>
            <td>{ao.analysis}</td>
            {(ma.encliticsAnalysis && 'analysis' in ma.encliticsAnalysis)
              ? <td>{ma.encliticsAnalysis.enclitics} @ {ma.encliticsAnalysis.analysis}</td>
              : <td/>}
          </tr>)}
      </tbody>
    </table>
  );
}


export function MultiMorphAnalysisOptionButtons({analysisOptions, toggleAnalysisSelection}: IProps): JSX.Element {

  return (
    <>
      {analysisOptions.map((ao, index) =>
        <div key={index} className="mb-1">
          <LetteredAnalysisOptionButton ao={ao} select={() => toggleAnalysisSelection(ao.letter)}/>
        </div>
      )}
    </>
  );
}
