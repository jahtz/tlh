import classNames from 'classnames';
import {SingleMorphologicalAnalysis} from '../../model/morphologicalAnalysis';

interface IProps {
  morphAnalysis: SingleMorphologicalAnalysis;
  toggleAnalysisSelection: () => void;
}

export function SingleMorphAnalysisOptionButton({morphAnalysis, toggleAnalysisSelection}: IProps): JSX.Element {
  return (
    <button className={classNames('button', 'is-fullwidth', 'button-text-left', {'is-link': morphAnalysis.selected})} onClick={toggleAnalysisSelection}>
      {morphAnalysis.number} - {morphAnalysis.analysis}
    </button>
  );
}