import {MultiMorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import {getSelectedEnclitics} from '../SelectedAnalysisResult';

export function MultiMorphAnalysisSelection({ma}: { ma: MultiMorphologicalAnalysis }): JSX.Element | null {

  const {number, translation, encliticsAnalysis} = ma;

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
            <td>{number}{ao.letter}{encliticsLetters}</td>
            <td>{translation}</td>
            <td>{ao.analysis}</td>
            {(encliticsAnalysis && 'analysis' in encliticsAnalysis)
              ? <td>{encliticsAnalysis.enclitics} @ {encliticsAnalysis.analysis}</td>
              : <td/>}
          </tr>)}
      </tbody>
    </table>
  );
}
