import {NodeDisplay} from '../xmlEditor/NodeDisplay';
import {LineParseResult} from './LineParseResult';

interface IProps {
  line: LineParseResult;
}

export function LineParseResultDisplay({line: {statusLevel, events, nodes}}: IProps): JSX.Element {

  const statusEvents = events.sort((a, b) => a.level.valueOf() - b.level.valueOf());

  return (
    <div>
      <span className="text-gray-500">({statusLevel})</span>

      &nbsp;{nodes.map((node, index) => <NodeDisplay key={index} node={node} isLeftSide={false}/>)}

      {statusEvents.map(({code, level, message}, index) =>
        <p key={index} className="italic text-cyan-600">
          {level} - {code}: {message}
        </p>
      )}
    </div>
  );

}