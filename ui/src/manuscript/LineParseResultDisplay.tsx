import {Line, StatusEvent} from 'simtex';
import {NodeDisplay} from '../xmlEditor/NodeDisplay';

interface IProps {
  line: Line;
}

export function LineParseResultDisplay({line}: IProps): JSX.Element {

  const status = line.getStatus();

  const statusEvents: StatusEvent[] = status
    .getEvents()
    .sort((a, b) => a.getLevel().valueOf() - b.getLevel().valueOf());

  return (
    <div>
      <span className="text-gray-500">({status.getLevel()})</span>

      &nbsp;{line.exportXml().map((node, index) => <NodeDisplay key={index} node={node} isLeftSide={false}/>)}

      {statusEvents.map((statusEvent, index) =>
        <p key={index} className="italic text-cyan-600">
          {statusEvent.getLevel()} - {statusEvent.getCode()}: {statusEvent.getMessage()}
        </p>
      )}
    </div>
  );

}