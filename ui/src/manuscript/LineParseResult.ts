import {Line, StatusEvent, StatusEventCode, StatusLevel} from 'simtex';
import {XmlNode} from 'simple_xml';

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