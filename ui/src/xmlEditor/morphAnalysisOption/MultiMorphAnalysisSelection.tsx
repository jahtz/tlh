import {MultiMorphologicalAnalysisWithoutEnclitics, MultiMorphologicalAnalysisWithSingleEnclitics} from '../../model/morphologicalAnalysis';
import {SingleEncliticsAnalysis} from '../../model/encliticsAnalysis';

interface IProps {
  ma: MultiMorphologicalAnalysisWithoutEnclitics | MultiMorphologicalAnalysisWithSingleEnclitics;
}

export function MultiMorphAnalysisSelection({ma}: IProps): JSX.Element | null {

  const {number, translation, analysisOptions} = ma;

  const encliticsAnalysis: undefined | SingleEncliticsAnalysis = 'encliticsAnalysis' in ma
    ? ma.encliticsAnalysis
    : undefined;

  const selectedAnalyses = analysisOptions.filter(({selected}) => selected);

  if (selectedAnalyses.length === 0) {
    return null;
  }


  return (
    <div className="p-2 mb-2 bg-teal-200 rounded">
      <table className="table w-full">
        <tbody>
          {selectedAnalyses
            .map(({letter, analysis}) => <tr key={letter}>
              <td>{number}{letter}</td>
              <td>{translation}</td>
              <td>{analysis}</td>
              <td>{encliticsAnalysis && <>{encliticsAnalysis.enclitics} @ {encliticsAnalysis.analysis}</>}</td>
            </tr>)}
        </tbody>
      </table>
    </div>
  );
}
