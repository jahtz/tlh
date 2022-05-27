import classNames from 'classnames';
import {SingleMorphologicalAnalysis} from '../../model/morphologicalAnalysis';

interface IProps {
  morphAnalysis: SingleMorphologicalAnalysis;
  toggleAnalysisSelection: () => void;
}

export function SingleMorphAnalysisOptionButton({morphAnalysis, toggleAnalysisSelection}: IProps): JSX.Element {
  return (
    <button className={classNames('p-2', 'rounded', 'w-full', morphAnalysis.selected ? ['bg-blue-500', 'text-white'] : ['border', 'border-slate-500'])}
            onClick={toggleAnalysisSelection}>
      {morphAnalysis.number} - {morphAnalysis.analysis}
    </button>
  );
}