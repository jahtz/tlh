import {NodeDisplay} from '../xmlEditor/NodeDisplay';
import {ReactElement} from 'react';
import {LineParseResult} from './LineParseResult';
import {StatusLevel} from 'simtex';

interface IProps {
  showStatusLevel: boolean;
  line: LineParseResult;
}

function displayStatusLevel(statusLevel: StatusLevel): ReactElement {
  switch (statusLevel) {
    case StatusLevel.ok:
      return <span className="text-green-500">&#10004;</span>;
    case StatusLevel.info:
      return <span className="text-amber-500">?</span>;
    case StatusLevel.error:
      return <span className="text-red-500">&#x26A0;</span>;
    case StatusLevel.critical:
      return <span className="text-red-600">&#x26A0;</span>;
  }
}

export function LineParseResultDisplay({showStatusLevel, line: {statusLevel, events, nodes}}: IProps): ReactElement {

  const statusEvents = events.sort((a, b) => a.level.valueOf() - b.level.valueOf());

  return (
    <div>
      {showStatusLevel && <span className="text-gray-500">({displayStatusLevel(statusLevel)})</span>}

      &nbsp;{nodes.map((node, index) => <NodeDisplay key={index} node={node} isLeftSide={false}/>)}

      {statusEvents.map(({code, level, message}, index) =>
        <p key={index} className="italic text-cyan-600">
          {level} - {code}: {message}
        </p>
      )}
    </div>
  );

}