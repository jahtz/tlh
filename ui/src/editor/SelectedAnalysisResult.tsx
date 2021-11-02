import React, {Fragment} from 'react';
import {MorphologicalAnalysis, SingleMorphologicalAnalysis} from '../model/morphologicalAnalysis';
import {getSelectedLetters, LetteredAnalysisOption} from '../model/analysisOptions';

export function getSelectedEnclitics(ma: MorphologicalAnalysis): string {
  const selectedEncliticLetteredOptions = ma.encliticsAnalysis
    ? 'analysis' in ma.encliticsAnalysis ? [] : ma.encliticsAnalysis.analysisOptions
    : [];

  return getSelectedLetters(selectedEncliticLetteredOptions).join('');

}

function SingleMorphAnalysisSelection({ma}: { ma: SingleMorphologicalAnalysis }): JSX.Element {
  if (!ma.selected) {
    return <Fragment/>;
  }

  function writeEnclitics(enclitics: string, selectedEnclitics: LetteredAnalysisOption[]): JSX.Element {
    return <>
      {selectedEnclitics.map(({letter, analysis}) => <p key={letter}>{enclitics} @ {analysis}</p>)}
    </>;
  }

  const encliticsLetters = getSelectedEnclitics(ma);

  return (
    <tr>
      <td>{ma.number}{encliticsLetters}</td>
      <td>{ma.translation}</td>
      <td>{ma.analysis}</td>
      {ma.encliticsAnalysis
        ? ('analysis' in ma.encliticsAnalysis
            ? <td>{ma.encliticsAnalysis.enclitics} @ {ma.encliticsAnalysis.analysis}</td>
            : <td>{writeEnclitics(ma.encliticsAnalysis.enclitics, ma.encliticsAnalysis.analysisOptions)}</td>
        )
        : <td/>}
    </tr>
  );
}
