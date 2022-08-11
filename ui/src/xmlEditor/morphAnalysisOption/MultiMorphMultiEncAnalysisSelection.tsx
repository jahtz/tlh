import {MultiMorphologicalAnalysisWithMultiEnclitics} from '../../model/morphologicalAnalysis';
import {LetteredAnalysisOption, SelectableLetteredAnalysisOption} from '../../model/analysisOptions';

interface IProps {
  ma: MultiMorphologicalAnalysisWithMultiEnclitics;
}

export function MultiMorphMultiEncAnalysisSelection({ma}: IProps): JSX.Element | null {

  const {number, translation, analysisOptions, encliticsAnalysis, selectedAnalysisCombinations} = ma;

  if (selectedAnalysisCombinations.length === 0) {
    return <></>;
  }

  const selectedAnalyses: [LetteredAnalysisOption, SelectableLetteredAnalysisOption][] = selectedAnalysisCombinations
    .flatMap(({morphLetter, encLetter}) => {
      const ao = analysisOptions.find(({letter}) => morphLetter === letter);
      const eao = encliticsAnalysis.analysisOptions.find(({letter}) => encLetter === letter);

      return ao && eao ? [[ao, eao]] : [];
    });

  return (
    <div className="p-2 mb-2 bg-teal-200 rounded">
      <table className="table w-full">
        <tbody>
          {selectedAnalyses
            .map(([{letter, analysis}, encliticsAnalysisOption]) => <tr key={letter}>
              <td>{number}{letter}{encliticsAnalysisOption.letter}</td>
              <td>{translation}</td>
              <td>{analysis}</td>
              <td>{encliticsAnalysis && <>{encliticsAnalysis.enclitics} @ {encliticsAnalysisOption.analysis}</>}</td>
            </tr>)}
        </tbody>
      </table>
    </div>
  );

}