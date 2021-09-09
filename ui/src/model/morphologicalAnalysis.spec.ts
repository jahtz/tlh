import {MultiMorphologicalAnalysis, readMorphologicalAnalysis, SingleMorphologicalAnalysis, writeMorphAnalysisValue} from './morphologicalAnalysis';

function normalizeString(value: string): string {
  return value
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ');
}

describe('morphologicalAnalysis', () => {

  // single morph, no enclitic

  const maString0 = 'wē-/uwa- @ kommen @ 3SG.PRS @ I.12 @ ';
  const ma0: Omit<SingleMorphologicalAnalysis, 'number'> = {
    referenceWord: 'wē-/uwa-',
    translation: 'kommen',
    analysis: '3SG.PRS',
    paradigmClass: 'I.12',
    selected: false,
  };

  // single morph, single enclitic, no determinativ

  const maString1 = 'paršn=ā(e)- @ sich niederhocken @ VBN.GEN.SG @ I.9 += kkan @ OBPk @  @ ';
  const ma1: Omit<SingleMorphologicalAnalysis, 'number'> = {
    referenceWord: 'paršn=ā(e)-',
    translation: 'sich niederhocken',
    analysis: 'VBN.GEN.SG',
    paradigmClass: 'I.9',
    encliticsAnalysis: {enclitics: 'kkan', analysis: 'OBPk', selected: false},
    selected: false
  };

  // single morph, single enclitic, with determinativ

  const maString2 = 'parašnau=aš @ Mann des Niederhockens @ GENunh @ 30.12 += kkan @ OBPk @  @ (LÚ)';
  const ma2: Omit<SingleMorphologicalAnalysis, 'number'> = {
    referenceWord: 'parašnau=aš',
    translation: 'Mann des Niederhockens',
    analysis: 'GENunh',
    paradigmClass: '30.12',
    encliticsAnalysis: {enclitics: 'kkan', analysis: 'OBPk', selected: false},
    determinativ: '(LÚ)',
    selected: false
  };

  // single morph, multiple enclitics

  const maString3 = `gen=u- @ Knie @ STF @ 3.1.1
		   += aš @
		{ R → PPRO.3SG.C.NOM}
		{ S → PPRO.3PL.C.ACC} @  @ `;
  const ma3: Omit<SingleMorphologicalAnalysis, 'number'> = {
    referenceWord: 'gen=u-',
    translation: 'Knie',
    analysis: 'STF',
    paradigmClass: '3.1.1',
    encliticsAnalysis: {
      enclitics: 'aš',
      analysisOptions: [
        {letter: 'R', analysis: 'PPRO.3SG.C.NOM', selected: false},
        {letter: 'S', analysis: 'PPRO.3PL.C.ACC', selected: false}
      ]
    },
    selected: false
  };


  // multiple morphs, no enclitics

  const maString4 = 'gen=u- @ Knie @ { a → GEN.SG} { b → GEN.PL} { c → D/L.PL} @ 3.1.1 @ ';
  const ma4: Omit<MultiMorphologicalAnalysis, 'number'> = {
    referenceWord: 'gen=u-',
    translation: 'Knie',
    analysisOptions: [
      {letter: 'a', analysis: 'GEN.SG', selected: false},
      {letter: 'b', analysis: 'GEN.PL', selected: false},
      {letter: 'c', analysis: 'D/L.PL', selected: false}
    ],
    paradigmClass: '3.1.1'
  };


  // multiple morphs, single enclitic

  const maString5 = `mezull=a- @ Mez(z)ul(l)a @
		{ a → DN.NOM.SG(UNM)}
		{ b → DN.ACC.SG(UNM)}
		{ c → DN.GEN.SG(UNM)}
		{ d → DN.D/L.SG(UNM)}
		{ e → DN.ABL(UNM)}
		{ f → DN.INS(UNM)}
		{ g → DN.VOC.SG} @ 35.1.1
		   += ma @ CNJctr @  @ D`;
  const ma5: Omit<MultiMorphologicalAnalysis, 'number'> = {
    referenceWord: 'mezull=a-',
    translation: 'Mez(z)ul(l)a',
    analysisOptions: [
      {letter: 'a', analysis: 'DN.NOM.SG(UNM)', selected: false},
      {letter: 'b', analysis: 'DN.ACC.SG(UNM)', selected: false},
      {letter: 'c', analysis: 'DN.GEN.SG(UNM)', selected: false},
      {letter: 'd', analysis: 'DN.D/L.SG(UNM)', selected: false},
      {letter: 'e', analysis: 'DN.ABL(UNM)', selected: false},
      {letter: 'f', analysis: 'DN.INS(UNM)', selected: false},
      {letter: 'g', analysis: 'DN.VOC.SG', selected: false}
    ],
    paradigmClass: '35.1.1',
    encliticsAnalysis: {enclitics: 'ma', analysis: 'CNJctr', selected: false},
    determinativ: 'D'
  };

  // multiple morph, multiple enclitic

  const maString6 = `gen=u- @ Knie @
		{ a → NOM.SG.N}
		{ b → ACC.SG.N}
		{ c → NOM.PL.N}
		{ d → ACC.PL.N}
		{ e → STF} @ 3.1.2
		   += aš @
		{ R → PPRO.3SG.C.NOM}
		{ S → PPRO.3PL.C.ACC} @  @ `;
  const ma6: Omit<MultiMorphologicalAnalysis, 'number'> = {
    referenceWord: 'gen=u-',
    translation: 'Knie',
    analysisOptions: [
      {letter: 'a', analysis: 'NOM.SG.N', selected: false},
      {letter: 'b', analysis: 'ACC.SG.N', selected: false},
      {letter: 'c', analysis: 'NOM.PL.N', selected: false},
      {letter: 'd', analysis: 'ACC.PL.N', selected: false},
      {letter: 'e', analysis: 'STF', selected: false}
    ],
    paradigmClass: '3.1.2',
    encliticsAnalysis: {
      enclitics: 'aš',
      analysisOptions: [
        {letter: 'R', analysis: 'PPRO.3SG.C.NOM', selected: false},
        {letter: 'S', analysis: 'PPRO.3PL.C.ACC', selected: false}
      ]
    }
  };

  test.each([
    [normalizeString(maString0), ma0],
    [normalizeString(maString1), ma1],
    [normalizeString(maString2), ma2],
    [normalizeString(maString3), ma3],
    [normalizeString(maString4), ma4],
    [normalizeString(maString5), ma5],
    [normalizeString(maString6), ma6],
  ])(
    'should read a morphological analysis string "%s" as %j',
    (toRead, expected) => expect(readMorphologicalAnalysis(1, toRead, [])).toEqual({...expected, number: 1})
  );


  test.each([
    [ma0, normalizeString(maString0)],
    [ma1, normalizeString(maString1)],
    [ma2, normalizeString(maString2)],
    [ma3, normalizeString(maString3)],
    [ma4, normalizeString(maString4)],
    [ma5, normalizeString(maString5)],
    [ma6, normalizeString(maString6)],
  ])(
    'should write a morphological analysis %j to a string "%s"',
    (toWrite, expected) =>
      expect(writeMorphAnalysisValue({...toWrite, number: 1}))
        // FIXME: this replaces a (perhaps?) redundant @
        .toEqual(expected.replace(/@\s*@/, '@'))
  );


});