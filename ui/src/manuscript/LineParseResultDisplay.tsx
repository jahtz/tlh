import {LineParseResult} from 'simtex';
import {NodeDisplay} from '../xmlEditor/NodeDisplay';

interface IProps {
  lineParseResult: LineParseResult;
}

export function LineParseResultDisplay({lineParseResult}: IProps): JSX.Element {

  if (lineParseResult.type === 'LinePreParsingError') {
    return <div>TODO: 1</div>;
  }

  if (lineParseResult.type === 'LineWordParsingError') {
    return <div>TODO: 2</div>;
  }

  const {lineNumber: {number, isConfirmed}, words, maybeParagraphSeparator} = lineParseResult;

  return (
    <div>
      <sup>{number}{isConfirmed ? '\'' : ''}</sup>
      &nbsp;
      {words.map((word, index) => <span key={index}><NodeDisplay node={word} isLeftSide={false}/>&nbsp;</span>)}

      {maybeParagraphSeparator && <NodeDisplay node={maybeParagraphSeparator} isLeftSide={false}/>}
    </div>
  );
}