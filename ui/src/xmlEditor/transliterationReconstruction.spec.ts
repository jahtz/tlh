import {reconstructTransliterationForWordNode} from './transliterationReconstruction';
import {XmlElementNode, xmlElementNode, XmlNode, xmlTextNode} from 'simple_xml';
import {newOk} from '../newResult';

type Child = XmlElementNode | string;

const clearChildren = (children: Child[]): XmlNode[] => children.map((child) => typeof child === 'string' ? xmlTextNode(child) : child);

// Helper funcs

const w = (...children: Child[]): XmlElementNode => xmlElementNode('w', {}, clearChildren(children));

const sGr = (...children: Child[]): XmlElementNode => xmlElementNode('sGr', {}, clearChildren(children));
const aGr = (...children: Child[]): XmlElementNode => xmlElementNode('aGr', {}, clearChildren(children));
const d = (...children: Child[]): XmlElementNode => xmlElementNode('d', {}, clearChildren(children));
const num = (...children: Child[]): XmlElementNode => xmlElementNode('num', {}, clearChildren(children));

const corr = (c: string): XmlElementNode<'corr'> => xmlElementNode('corr', {c});
const space = (c: string): XmlElementNode<'space'> => xmlElementNode('space', {c});
const materlect = (c: string): XmlElementNode<'materlect'> => xmlElementNode('materlect', {c});
const subscr = (c: string): XmlElementNode<'subscr'> => xmlElementNode('subscr', {c});

// Elements

const del_in = xmlElementNode('del_in');
const del_fin = xmlElementNode('del_fin');

const laes_in = xmlElementNode('laes_in');
const laes_fin = xmlElementNode('laes_fin');

const ras_in = xmlElementNode('ras_in');
const ras_fin = xmlElementNode('ras_fin');

const parsep = xmlElementNode('parsep');
const parsep_dbl = xmlElementNode('parsep_dbl');

type TestData = { node: XmlElementNode, expected: string };

// From Google Spreadsheets
const testCases: TestData[] = [
  {node: w(aGr('I-NA')), expected: '_I-NA'}, // 0 <-> Z_002
  {node: w(del_in, aGr('A-NA')), expected: '[_A-NA'},
  {node: w(aGr(del_in, 'A-NA')), expected: '_[A-NA'},
  {node: w(aGr('ME-E', del_fin)), expected: '_ME-E]'},
  {node: w(aGr('UŠ-K', del_fin, 'É-', laes_in, 'EN'), laes_fin), expected: '_UŠ-K]É-⸢EN⸣'},
  {node: w(aGr('BE-', laes_in, 'EL', laes_fin)), expected: '_BE-⸢EL⸣'}, // 5 <-> Z_007
  // {node: w(aGr('I+NA')), expected: '_I+_NA'},
  {node: w(aGr('IŠ'), corr('sic'), aGr('-TU')), expected: '_IŠsic-TU'},
  {node: w(del_in, aGr('IN-BI'), d('ḪI.A'), '-ia-aš-ša-a', del_fin, 'n'), expected: '[_IN-BI°ḪI.A°-ia-aš-ša-a]n'},
  {node: w(aGr('ANA'), ' ', d('D'), laes_in, sGr('10'), corr('?'), laes_fin), expected: '_ANA °D°⸢10?⸣'},
  {node: w(aGr('A-DI'), ' ', sGr('EN'), aGr('-KA₄')), expected: '_A-DI EN-KA₄'}, // 10 <-> Z_012
  // {node: w(aGr('A+NA'), ' ', sGr('EN'), aGr('-KA₄')), expected: '_A+_NA EN-KA₄'},
  {node: w(aGr('AŠ-ŠUM'), ' ', sGr('DINGIR'), d('MEŠ')), expected: '_AŠ-ŠUM DINGIR°MEŠ°'},
  {node: w(aGr('QA-DU'), ' ', sGr('DINGIR'), d('MEŠ')), expected: '_QA-DU DINGIR°MEŠ°'},
  {node: w(aGr('QA-DU₄'), ' ', sGr('DINGIR'), d('MEŠ')), expected: '_QA-DU₄ DINGIR°MEŠ°'},
  {node: w(aGr('ŠA-PAL'), ' ', d('LÚ.MEŠ'), sGr('NAR')), expected: '_ŠA-PAL °LÚ.MEŠ°NAR'}, // 15 <-> Z_017
  {node: w(aGr('IŠ-TU'), ' ', num('7')), expected: '_IŠ-TU 7'},
  {node: w(aGr('A-NA'), ' ', sGr('É.GAL')), expected: '_A-NA É.GAL'},
  {node: w(aGr('I-NA'), ' ', d('GIŠ'), sGr('MA.SÁ.AB')), expected: '_I-NA °GIŠ°MA.SÁ.AB'},
  // {node: w(aGr('I+NA'), ' ', d('GIŠ'), sGr('MA.SÁ.AB')), expected: '_I+_NA °GIŠ°MA.SÁ.AB'},
  {node: w(aGr('INA'), ' ', d('GIŠ'), sGr('MA.SÁ.AB')), expected: '_INA °GIŠ°MA.SÁ.AB'}, // 20 <-> Z_022
  // {node: w(aGr('IT-TI BE-LÍ-KA₄')), expected: '_IT-TI _BE-LÍ-KA₄'},
  // {node: w(aGr('A-NA˽ŠA-PAL'), ' ', d('GIŠ'), 'ti-im-ma-ḫi-la-aš'), expected: '_A-NA˽_ŠA-PAL °GIŠ°ti-im-ma-ḫi-la-aš'},
  // {node: w(aGr('I-NA˽ŠA-PAL'), ' ', d('GIŠ'), 'ti-im-ma-ḫi-la-aš'), expected: '_I-NA˽_ŠA-PAL °GIŠ°ti-im-ma-ḫi-la-aš'},
  // {node: w(aGr('I-NA˽PA-NI'), ' ', d('GIŠ'), 'ti-im-ma-ḫi-la-aš'), expected: '_I-NA˽_PA-NI °GIŠ°ti-im-ma-ḫi-la-aš'},
  // {node: w(aGr('IŠ-TU˽ŠA'), ' ', sGr('LUGAL')), expected: '_IŠ-TU˽_ŠA LUGAL'}, // 25 <-> Z_027,
  {node: w(aGr('ŠA'), ' ', sGr('É')), expected: '_ŠA É'},
  {node: w(aGr('ŠA-A'), ' ', sGr('É')), expected: '_ŠA-A É'},
  {node: w(aGr('ŠÁ'), ' ', sGr('É')), expected: '_ŠÁ É'},
  {node: w(aGr('ŠA'), ' ', num('2'), sGr('.ÀM'), corr('!')), expected: '_ŠA 2.ÀM!'},
  {node: w(aGr('ŠA'), ' ', d('m'), 'ḫa-at-tu-ši-li'), expected: '_ŠA °m°ḫa-at-tu-ši-li'}, // 30 <-> Z_032
  {node: w(aGr('ŠA'), ' ', d('D'), 'ti-ti-', del_in, 'wa', del_fin, '-', laes_in, 'at', laes_fin, '-t', del_in, 'i'), expected: '_ŠA °D°ti-ti-[wa]-⸢at⸣-t[i'},
  {
    node: w(aGr('PA-NI'), ' ', d('D'), 'ti-ti-', del_in, 'wa', del_fin, '-', laes_in, 'at', laes_fin, '-t', del_in, 'i'),
    expected: '_PA-NI °D°ti-ti-[wa]-⸢at⸣-t[i'
  },
  {node: w('ap', corr('!'), '-pa-an'), expected: 'ap!-pa-an'},
  {node: w('pé-ra-an'), expected: 'pé-ra-an'},
  {node: w(del_in, 'ma-a-an'), expected: '[ma-a-an'}, // 35 <-> Z_037
  {node: w(del_in, 'wa-ar-nu-zi', del_fin), expected: '[wa-ar-nu-zi]'},
  {node: w('a', del_fin, 'r-ḫa'), expected: 'a]r-ḫa'},
  {node: w('d', del_fin, 'a-a-', ras_in, 'i', ras_fin), expected: 'd]a-a-*i*'},
  {node: w('lu-u', del_fin, 'k', corr('?'), '-', laes_in, 'ka', corr('?'), '-ta', laes_fin), expected: 'lu-u]k?-⸢ka?-ta⸣'},
  {node: w('z', del_fin, 'u-', laes_in, 'uz-zu', laes_fin, '-ma-k', del_in, 'i-ip'), expected: 'z]u-⸢uz-zu⸣-ma-k[i-ip'}, // 40 <-> Z_042
  {node: w('an-', laes_in, 'da', laes_fin), expected: 'an-⸢da⸣'},
  {node: w(laes_in, 'ar', laes_fin, '-r', del_in, 'a-an-zi', del_fin), expected: '⸢ar⸣-r[a-an-zi]'},
  {node: w('ḫur', laes_fin, '-l', del_in, 'i-li'), expected: 'ḫur⸣-l[i-li'},
  {node: w('pé-ḫu-t', del_fin, 'e-', laes_in, 'ez', laes_fin, '-zi'), expected: 'pé-ḫu-t]e-⸢ez⸣-zi'},
  {node: w('kat+ta'), expected: 'kat+ta'}, // 45 <-> Z_047
  {node: w('ka₄-a-ša'), expected: 'ka₄-a-ša'},
  {node: w(d('LÚ.MEŠ'), sGr('MUḪALDIM')), expected: '°LÚ.MEŠ°MUḪALDIM'},
  /* '°m°°.°°D°IŠKUR-šar-ru-um-ma' original form not relevant! */
  {node: w(d('m.D'), sGr('IŠKUR'), '-šar-ru-um-ma'), expected: '°m.D°IŠKUR-šar-ru-um-ma'},
  {node: w(d('NA₄'), 'ḫu-wa-ši-ia'), expected: '°NA₄°ḫu-wa-ši-ia'}, // 50 <-> Z_052
  {node: w(d('DUG'), 'ḫal-wa-ni-uš'), expected: '°DUG°ḫal-wa-ni-uš'},
  {node: w(d('DU', del_fin, 'G'), 'ḫu-u-up-ru-uš-ḫi'), expected: '°DU]G°ḫu-u-up-ru-uš-ḫi'},
  {node: w(d('DUG'), 'a-aḫ-', laes_in, 'ru-uš', laes_fin, '-', del_in, 'ḫi-ia-az'), expected: '°DUG°a-aḫ-⸢ru-uš⸣-[ḫi-ia-az'},
  {node: w(d(ras_in, 'GIŠ', ras_fin), 'lu-u-e-eš-ša'), expected: '°*GIŠ*°lu-u-e-eš-ša'},
  // {node: w(d('m'), 'mur-ši-', sGr('DINGIR'), aGr('-LIM')), expected: '°m°mur-ši--DINGIR-LIM'}, // 55 <-> Z_057
  {node: w(d('D'), sGr('30')), expected: '°D°30'},
  {node: w(d('D'), sGr('10')), expected: '°D°10'},
  {node: w(d('LÚ'), sGr('AZU')), expected: '°LÚ°AZU'},
  {node: w(del_in, d('GIŠ'), sGr('EREN')), expected: '[°GIŠ°EREN'},
  {node: w(d('GI', del_fin, 'Š'), sGr('EREN'), '-ia-kán'), expected: '°GI]Š°EREN-ia-kán'}, // 60 <-> Z_062
  {node: w(d('DUG'), sGr('GAL'), d('ḪI.A')), expected: '°DUG°GAL°ḪI.A°'},
  {node: w('ap-pa-an', corr('?')), expected: 'ap-pa-an?'},
  {node: w('ap-pa-an', corr('(?)')), expected: 'ap-pa-an(?)'},
  /* pa-<a>-i nicht relevant */
  // TODO: Glossenkeil, Glossenkeil doppelt!
  {node: w('pa-〈a〉-i'), expected: 'pa-〈a〉-i'}, // 61 <-> Z_069
  {node: w(space('9')), expected: '         '},
  {node: w(parsep), expected: '§'},
  {node: w(parsep_dbl), expected: '§§'},
  {node: w(d('MUNUS'), 'kat', materlect('at'), '-re-eš'), expected: '°MUNUS°kat°at°-re-eš'}, // Z_075
  {node: w('kar-', materlect('di'), 'dim-mi-ia-az'), expected: 'kar-°di°dim-mi-ia-az'},
  {node: w('pa-', ras_in, 'a', ras_fin, '-i'), expected: 'pa-*a*-i'},
  {node: w(ras_in, 'ap-pa-an', ras_fin), expected: '*ap-pa-an*'},
  {node: w('ap', corr('sic'), '-pa-an'), expected: 'apsic-pa-an'},
  {node: w(sGr('UD')), expected: 'UD'}, // Z_080
  {node: w(del_in, sGr('SÍSKUR')), expected: '[SÍSKUR'},
  {node: w(sGr('SÍSK', del_fin, 'UR')), expected: 'SÍSK]UR'},
  {node: w(sGr('NINDA.GUR.RA₄')), expected: 'NINDA.GUR.RA₄'},
  {node: w(sGr('KA×U')), expected: 'KA×U'},
  {node: w(sGr('DUMU'), d('MEŠ'), sGr('.É.GAL')), expected: 'DUMU°MEŠ°.É.GAL'}, // Z_085
  {node: w(sGr('GIŠ.'), d('D'), sGr('INANNA')), expected: 'GIŠ.°D°INANNA'},
  {node: w(sGr('TU₇'), '˽', sGr('BA.BA.ZA')), expected: 'TU₇˽BA.BA.ZA'},
  {node: w(sGr('DINGIR'), aGr('-LIM')), expected: 'DINGIR-LIM'},
  {node: w(sGr('EN'), aGr('-ŠU')), expected: 'EN-ŠU'},
  {node: w(sGr('DINGIR', del_fin), aGr('-LIM')), expected: 'DINGIR]-LIM'}, // Z_090
  {node: w(sGr('DIN', del_fin, 'GIR'), aGr('-', laes_in, 'LIM'), laes_fin), expected: 'DIN]GIR-⸢LIM⸣'},
  {node: w(sGr('GÙB'), '-la-az'), expected: 'GÙB-la-az'},
  {node: w(del_in, sGr('MUN'), '-ia-aš-ša-an'), expected: '[MUN-ia-aš-ša-an'},
  {node: w(sGr('É'), '-er', del_fin), expected: 'É-er]'},
  {node: w(sGr('Ì.DU₁₀.GA'), '-ia'), expected: 'Ì.DU₁₀.GA-ia'}, // Z_095
  {node: w(sGr('LÚ'), d('MEŠ'), '-aš'), expected: 'LÚ°MEŠ°-aš'},
  {node: w(del_in, sGr('NINDA.SIG'), d('ḪI.A'), '-ia'), expected: '[NINDA.SIG°ḪI.A°-ia'},
  {node: w(d('L', del_in, 'Ú'), sGr('AZU'), '-i', del_fin, 'a'), expected: '°L[Ú°AZU-i]a'},
  {node: w('pa-a-〈〈a〉〉-i'), expected: 'pa-a-〈〈a〉〉-i'},
  {node: w('kaₓ-anₓ-na'), expected: 'kaₓ-anₓ-na'},
  {node: w(num('1')), expected: '1'},
  {node: w(num('½')), expected: '½'},
  {node: w(num('1'), aGr('-ŠU')), expected: '1-ŠU'},
  {node: w(num('8'), del_fin, aGr('-ŠU')), expected: '8]-ŠU'},
  {node: w(num('1'), '-aš'), expected: '1-aš'},
  {node: w(num('2'), d('KAM')), expected: '2°KAM°'},
  {node: w(d('NINDA'), 'ta-pár-wa', subscr('a'), '-šu-ú-i'), expected: '°NINDA°ta-pár-wa|a-šu-ú-i'},
  {node: w('wi', subscr('i'), '-i-en'), expected: 'wi|i-i-en'},
  {node: w(sGr('SILA₄.SÍG+MUNUS')), expected: 'SILA₄.SÍG+MUNUS'},
];

describe('textReconstruction', () =>
  test.each<TestData>(testCases)(
    '$# should reconstruct $expected correctly',
    ({node, expected}) => {
      expect(reconstructTransliterationForWordNode(node)).toEqual(newOk(expected));
    }
  )
);
