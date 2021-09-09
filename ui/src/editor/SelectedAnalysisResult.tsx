import React, {Fragment} from 'react';
import {MorphologicalAnalysis} from '../model/morphologicalAnalysis';
import {getSelectedLetters, LetteredAnalysisOption} from '../model/analysisOptions';

interface IProps {
  ma: MorphologicalAnalysis;
}

export function SelectedAnalysisResult({ma}: IProps): JSX.Element {

  const selectedEncliticLetteredOptions = ma.encliticsAnalysis
    ? 'analysis' in ma.encliticsAnalysis ? [] : ma.encliticsAnalysis.analysisOptions
    : [];

  const encliticsLetters = getSelectedLetters(selectedEncliticLetteredOptions).join('');

  function writeEnclitics(enclitics: string, selectedEnclitics: LetteredAnalysisOption[]): JSX.Element {
    return <>
      {selectedEnclitics.map(({letter, analysis}) => <p key={letter}>{enclitics} @ {analysis}</p>)}
    </>;
  }

  if ('analysis' in ma) {
    if (!ma.selected) {
      return <Fragment/>;
    }

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

  } else {
    return (
      <>
        {ma.analysisOptions
          .filter(({selected}) => selected)
          .map((ao) => <tr key={ao.letter}>
            <td>{ma.number}{ao.letter}{encliticsLetters}</td>
            <td>{ma.translation}</td>
            <td>{ao.analysis}</td>
            {(ma.encliticsAnalysis && 'analysis' in ma.encliticsAnalysis)
              ? <td>{ma.encliticsAnalysis.enclitics} @ {ma.encliticsAnalysis.analysis}</td>
              : <td/>}
          </tr>)}
      </>
    );
  }
}