import {MorphologicalAnalysis, readMorphologicalAnalysis} from './model/morphologicalAnalysis';

describe('morphologicalAnalysis', () => {

  // single morph, no enclitic

  const maString0 = 'wē-/uwa- @ kommen @ 3SG.PRS @ I.12 @ ';
  const ma0: Omit<MorphologicalAnalysis, 'number'> = {
    referenceWord: 'wē-/uwa-',
    translation: 'kommen',
    analysis: '3SG.PRS',
    paradigmClass: 'I.12'
  };

  // single morph, single enclitic, no determinativ

  const maString1 = 'paršn=ā(e)- @ sich niederhocken @ VBN.GEN.SG @ I.9 += kkan @ OBPk @  @ ';
  const ma1: Omit<MorphologicalAnalysis, 'number'> = {
    referenceWord: 'paršn=ā(e)-',
    translation: 'sich niederhocken',
    analysis: 'VBN.GEN.SG',
    paradigmClass: 'I.9',
    encliticsAnalysis: {enclitics: 'kkan', analysis: 'OBPk'}
  };

  // single morph, single enclitic, with determinativ

  const maString2 = 'parašnau=aš @ Mann des Niederhockens @ GENunh @ 30.12 += kkan @ OBPk @  @ (LÚ)';
  const ma2: Omit<MorphologicalAnalysis, 'number'> = {
    referenceWord: 'parašnau=aš',
    translation: 'Mann des Niederhockens',
    analysis: 'GENunh',
    paradigmClass: '30.12',
    encliticsAnalysis: {enclitics: 'kkan', analysis: 'OBPk'},
    determinativ: '(LÚ)'
  };

  // single morph, multiple enclitics

  const maString3 = `gen=u- @ Knie @ STF @ 3.1.1
		   += aš @
		{ R → PPRO.3SG.C.NOM}
		{ S → PPRO.3PL.C.ACC} @  @`;
  const ma3: Omit<MorphologicalAnalysis, 'number'> = {
    referenceWord: 'gen=u-',
    translation: 'Knie',
    analysis: 'STF',
    paradigmClass: '3.1.1',
    encliticsAnalysis: {
      enclitics: 'aš',
      analysis: [
        {letter: 'R', analysis: 'PPRO.3SG.C.NOM'},
        {letter: 'S', analysis: 'PPRO.3PL.C.ACC'}
      ]
    }
  };


  // multiple morphs, no enclitics

  const maString4 = 'gen=u- @ Knie @ { a → GEN.SG} { b → GEN.PL} { c → D/L.PL} @ 3.1.1 @ ';
  const ma4: Omit<MorphologicalAnalysis, 'number'> = {
    referenceWord: 'gen=u-',
    translation: 'Knie',
    analysis: [
      {letter: 'a', analysis: 'GEN.SG'},
      {letter: 'b', analysis: 'GEN.PL'},
      {letter: 'c', analysis: 'D/L.PL',}
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
  const ma5: Omit<MorphologicalAnalysis, 'number'> = {
    referenceWord: 'mezull=a-',
    translation: 'Mez(z)ul(l)a',
    analysis: [
      {letter: 'a', analysis: 'DN.NOM.SG(UNM)'},
      {letter: 'b', analysis: 'DN.ACC.SG(UNM)'},
      {letter: 'c', analysis: 'DN.GEN.SG(UNM)'},
      {letter: 'd', analysis: 'DN.D/L.SG(UNM)'},
      {letter: 'e', analysis: 'DN.ABL(UNM)'},
      {letter: 'f', analysis: 'DN.INS(UNM)'},
      {letter: 'g', analysis: 'DN.VOC.SG'}
    ],
    paradigmClass: '35.1.1',
    encliticsAnalysis: {enclitics: 'ma', analysis: 'CNJctr'},
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
  const ma6: Omit<MorphologicalAnalysis, 'number'> = {
    referenceWord: 'gen=u-',
    translation: 'Knie',
    analysis: [
      {letter: 'a', analysis: 'NOM.SG.N'},
      {letter: 'b', analysis: 'ACC.SG.N'},
      {letter: 'c', analysis: 'NOM.PL.N'},
      {letter: 'd', analysis: 'ACC.PL.N'},
      {letter: 'e', analysis: 'STF'}
    ],
    paradigmClass: '3.1.2',
    encliticsAnalysis: {
      enclitics: 'aš',
      analysis: [
        {letter: 'R', analysis: 'PPRO.3SG.C.NOM'},
        {letter: 'S', analysis: 'PPRO.3PL.C.ACC'}
      ]
    }
  };


  test.each`
    toRead       | expected
    ${maString0} | ${ma0}
    ${maString1} | ${ma1}
    ${maString2} | ${ma2}
    ${maString3} | ${ma3}
    ${maString4} | ${ma4}
    ${maString5} | ${ma5}
    ${maString6} | ${ma6}
    `(
    'should read a morphological analysis string',
    ({toRead, expected}) => expect(readMorphologicalAnalysis(1, toRead)).toEqual({...expected, number: 1})
  );


});