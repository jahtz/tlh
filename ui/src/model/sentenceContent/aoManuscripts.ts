import {childElementReader, indent, XmlFormat} from "../../editor/xmlLib";
import {mapResult, success} from '../../functional/result';

export interface AOTxtPubl {
  type: 'AO:TxtPubl';
  content: string;
}

const aoTxtPublFormat: XmlFormat<AOTxtPubl> = {
  read: (el) => success(aoTxtPubl(el.textContent || '')),
  write: ({content}) => [`<AO:TxtPubl>${content}</AO:TxtPubl>`]
}

function aoTxtPubl(content: string): AOTxtPubl {
  return {type: 'AO:TxtPubl', content};
}

// AOManuscripts

export interface AOManuscripts {
  type: 'AO:Manuscripts';
  aoTxtPubl: AOTxtPubl;
}

export const aoManuscriptsFormat: XmlFormat<AOManuscripts> = {
  read: (el) => mapResult(childElementReader(el, 'AO:TxtPubl', aoTxtPublFormat), aoManuscripts),
  write: ({aoTxtPubl}) => ['<AO:Manuscripts>', ...aoTxtPublFormat.write(aoTxtPubl).map(indent), '</AO:Manuscripts>']
}

function aoManuscripts(aoTxtPubl: AOTxtPubl): AOManuscripts {
  return {type: 'AO:Manuscripts', aoTxtPubl};
}
