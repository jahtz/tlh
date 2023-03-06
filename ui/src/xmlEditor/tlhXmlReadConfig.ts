import {XmlReadConfig, LetterCorrection} from 'simple_xml';

const letterCorrections: LetterCorrection = [
  // Corrections
  ['š', 'š' /* kombi zu 161 */], ['Š', 'Š' /* kombi zu 160 */],
  ['ḫ̮', 'ḫ'], ['Ḫ̮', 'Ḫ'], ['ḫ', 'ḫ'], ['Ḫ', 'Ḫ'], ['h', 'ḫ'], ['H', 'Ḫ'],
  ['̮', '' /* Achtung, überzähliger Bogen unter Het! schlecht sichtbar */],
  ['〈', '〈' /* U+3008 aus CJK zu  U+2329 */], ['〉', '〉'],
  // Harmonizations
  ['á', 'á'], ['à', 'à'], ['â', 'â'], ['ā', 'ā'],
  ['é', 'é'], ['è', 'è'], ['ê', 'ê'], ['ē', 'ē'],
  ['í', 'í'], ['ì', 'ì'], ['î', 'î'], ['ī', 'ī'],
  ['ú', 'ú'], ['ù', 'ù'], ['û', 'û'], ['ū', 'ū'],
];

export const tlhXmlReadConfig: XmlReadConfig = {
  w: {letterCorrections, keepSpaces: true}
};
