import {Line, StatusEvent, StatusEventCode, StatusLevel} from 'simtex';
import {XmlNode} from 'simple_xml';
import {isOk, newError, NewAbstractResult, newOk} from '../newResult';

export interface IStatusEvent {
  readonly level: StatusLevel,
  readonly code: StatusEventCode,
  readonly message: string
}

export interface LineParseResult {
  readonly input: string;
  readonly statusLevel: StatusLevel;
  readonly events: IStatusEvent[];
  readonly nodes: XmlNode[];
}

const convertStatusEvent = (statusEvent: StatusEvent): IStatusEvent => ({
  level: statusEvent.getLevel(),
  code: statusEvent.getCode(),
  message: statusEvent.getMessage()
});

export const convertLine = (line: Line): LineParseResult => ({
  input: line.getSource().getText(),
  statusLevel: line.getStatus().getLevel(),
  events: line.getStatus().getEvents().map(convertStatusEvent),
  nodes: line.exportXml()
});


export const filterResults = (results: LineParseResult[]): NewAbstractResult<XmlNode[][], string[]> => results.reduce<NewAbstractResult<XmlNode[][], string[]>>(
  (acc, current) => {
    if (current.statusLevel === StatusLevel.ok) {
      return acc.map((a) => [...a, current.nodes]);
      /*
      return acc.status
        ? newOk([...acc.value, current.nodes])
        : acc;
       */
    } else {
      const newSingleError = 'TODO!';

      return isOk(acc)
        ? newError([newSingleError])
        : acc.mapError((errors) => [...errors, newSingleError]);
    }
  },
  newOk([])
);
