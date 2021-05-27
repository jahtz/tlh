import {parseTransliterationLine} from './parser';
import {lineParseResult, LineParseResult} from "../model/lineParseResult";
import {parsedWord as w} from "../model/sentenceContent/word";
import {determinativ as dt} from "../model/wordContent/determinativ";
import {numeralContent as nc} from "../model/wordContent/numeralContent";
import {materLectionis as ml} from "../model/wordContent/materLectionis";
import {de, ds, le, ls, re, rs, sc, supE, supS, uc, ue, us} from './testHelpers';
import {aoEllipsis} from "../model/wordContent/ellipsis";
import {akkadogramm as ag} from "../model/wordContent/akkadogramm";
import {sumerogramm as sg} from "../model/wordContent/sumerogramm";
import {paragraphSeparator, paragraphSeparatorDouble} from "../model/paragraphSeparators";
import {aoIllegibleContent} from "../model/wordContent/illegible";
import {aoKolonMark} from "../model/wordContent/kolonMark";
import {aoNote} from "../model/wordContent/footNote";
import {aoGap} from "../model/sentenceContent/gap";
import {indexDigit as id} from "../model/wordContent/indexDigit";
import {inscribedLetter} from "../model/wordContent/inscribedLetter";

describe.skip('The transliteration parser', () => {

  const line01 = "1# ta LUGAL-uš A-NA DUTU AN-E x GUx.MAḪ pa-a-i {K:34}";
  const result01 = lineParseResult("1", [
    // <w>ta</w> <w><sGr>LUGAL</sGr>-uš</w> <w><sGr>A</sGr><aGr>-NA</aGr></w> <w><sGr>DUTU</sGr></w> <w><sGr>AN</sGr><aGr>-E</aGr></w>
    w('ta'), w(sg('LUGAL'), '-uš'), w(sg('A'), ag('-', 'NA')), w(sg('DUTU')), w(sg('AN'), ag('-', 'E')),
    // x <w><sGr>GUₓ.MAḪ</sGr></w> <w>pa-a-i</w> <w><SP___AO_3a_-KolonMark>K:34</SP___AO_3a_-KolonMark></w>
    w(aoIllegibleContent), w(sg('GU', id('x'), '.', 'MAḪ')), w('pa-a-i'), w(aoKolonMark('34'))
  ]);

  const line02 = "1'# [ ... ] ⸢ú?-e?-te-na-an-za⸣";
  const result02 = lineParseResult("1'", [
    // <w><del_in/></w> <w><sGr>...</sGr></w> <w><del_fin/></w> <w><laes_in/>ú<corr c='?'/>-e<corr c='?'/>-te-na-an-za<laes_fin/></w>
    w(ds), w(aoEllipsis), w(de), w(ls, 'ú', uc, '-e', uc, '-te-na-an-za', le)
  ]);

  const line03 = "2'# [ ... ] ⸢nu⸣ LÚKÚR ku-e-da-ni pé-di";
  const result03 = lineParseResult(
    "2'", [
      // <w><del_in/></w> <w><sGr>...</sGr></w> <w><del_fin/></w> <w><laes_in/>nu<laes_fin/></w> <w><sGr>LÚKÚR</sGr></w> <w>ku-e-da-ni</w> <w>pé-di</w>
      w(ds), w(aoEllipsis), w(de), w(ls, 'nu', le), w(sg('LÚKÚR')), w('ku-e-da-ni'), w('pé-di')
    ]);

  const line04 = "3'# [ ... wa-ar-pa da-a]-iš* *na-aš-kán a-pé-e-ez";
  const result04 = lineParseResult("3'", [
    // <w><del_in/></w> <w><sGr>...</sGr></w> <w>wa-ar-pa</w> <w>da-a<del_fin/>-iš<ras_in/></w> <w><ras_fin/>na-aš-kán</w> <w>a-pé-e-ez</w>
    w(ds), w(aoEllipsis), w('wa-ar-pa'), w('da-a', de, '-iš', rs), w('*na-aš-kán', re, 'na-aš-kán'), w('a-pé-e-ez', 'a-pé-e-ez')
  ]);

  const line05 = "4'# [ ... mdu-ut-ḫa-l]i-ia-aš GAL ME-ŠE-DI";
  const result05 = lineParseResult("4'", [
    // <w><del_in/></w> <w><sGr>...</sGr></w> <w>mdu-ut-ḫa-l<del_fin/>i-ia-aš</w> <w><sGr>GAL</sGr></w> <w><sGr>ME</sGr><aGr>-ŠE-DI</aGr></w>
    w(ds), w(aoEllipsis), w('mdu-ut-ḫa-l', de, 'i-ia-aš'), w(sg('GAL')), w(sg('ME'), ag('-', 'ŠE', '-', 'DI'))
  ]);

  const line06 = "5'# [ ... -uš-m]a-⸢aš-ši⸣ ku-i-e-eš";
  const result06 = lineParseResult("5'", [
    // <w><del_in/></w> <w><sGr>...</sGr></w> <w>-uš-m<del_fin/>a-<laes_in/>aš-ši<laes_fin/></w> <w>ku-i-e-eš</w>
    w(ds), w(aoEllipsis), w('-uš-m', de, 'a-', ls, 'aš-ši', le), w('ku-i-e-eš')
  ]);

  const line07 = "6'# [ ... pa-ra-a] da-a-aš ¬¬¬";
  const result07 = lineParseResult("6'", [
    // <w><del_in/></w> <w><sGr>...</sGr></w> <w>pa-ra-a<del_fin/></w> <w>da-a-aš</w> </s></p><parsep/><p><s>
    w(ds), w(aoEllipsis), w('pa-ra-a', de), w('da-a-aš'), w(paragraphSeparator)
  ]);

  const line08 = "7'# [ ... ] x  °m°mur-ši--DINGIR-LIM °MUNUS°ŠU.GI LÚ°MEŠ° DINGIR°MEŠ°-aš";
  const result08 = lineParseResult("7'", [
    // <w><del_in/></w> <w><sGr>...</sGr></w> <w><del_fin/></w> x <w><d>m</d>mur-ši-<sGr>DINGIR</sGr><aGr>-LIM</aGr></w>
    w(ds), w(aoEllipsis), w(de), w(aoIllegibleContent), w(dt('m'), 'mur-ši', sg('DINGIR'), ag('-', 'LIM')),
    // <w><d>MUNUS</d><sGr>ŠU.GI</sGr></w> <w><sGr>LÚ</sGr><d>MEŠ</d></w> <w><sGr>DINGIR</sGr><d>MEŠ</d>-aš</w>
    w(dt('MUNUS'), sg('ŠU', '.', 'GI')), w(sg('LÚ'), dt('MEŠ')), w(sg('DINGIR'), dt('MEŠ'), '-aš')
  ]);

  const line09 = "8'# [ ] °m.D°30--SUM  ù °m.D°30--SUM{F: Problem mit den Punkten in Determinativen.}";
  const result09 = lineParseResult("8'", [
    // <w><del_in/></w> <w><del_fin/></w> <w><d>m.D</d><sGr>30</sGr>-<sGr>SUM</sGr></w> <w>ù</w>
    w(ds), w(de), w(dt('m.D'), sg('30'), '-', sg('SUM')), w('ù'),
    // <w><SP___AO_3a_MaterLect>m.D</SP___AO_3a_MaterLect><num>30</num>-<sGr>SUM</sGr><note  n='1'  c="   &lt;P_f_Footnote&gt;Problem mit den Punkten in Determinativen.&lt;/P_f_Footnote&gt;"  /></w>
    w(dt('m.D'), nc('30'), '-', sg('SUM'), aoNote('Problem mit den Punkten in Determinativen.'))
  ]);

  const line10 = "9' # °URU°?ša-mu-ḫa °URU°!ša-*mu-ḫa*   °URU?°ša?-mu-ḫa °URU!°ša-mu!-ḫa";
  const result10 = lineParseResult("9'", [
    // <w><d>URU</d><corr c='?'/>ša-mu-ḫa</w> <w><d>URU</d><corr c='!'/>ša-<ras_in/>mu-ḫa<ras_fin/></w>
    w(dt('URU'), uc, 'ša-mu-ḫa'), w(dt('URU'), sc, 'ša-', rs, 'mu-ḫa', rs),
    // <w><SP___AO_3a_MaterLect>URU?</SP___AO_3a_MaterLect>ša<corr c='?'/>-mu-ḫa</w> <w><SP___AO_3a_MaterLect>URU!</SP___AO_3a_MaterLect>ša-mu<corr c='!'/>-ḫa</w>
    w(/*, TODO: ml('URU?'), ('ša'), uc, ('-mu-ḫa')*/), w( /* TODO:, ml('URU!'), ('ša-mu'), sc, ('-ḫa'))*/)
  ]);

  const line11 = "10 # BLABLA-ṢU _ŠI-PÁT";
  const result11 = lineParseResult("10", [
    // <w><sGr>BLABLA</sGr><aGr>-ṢU</aGr></w> <w><aGr>ŠI-PÁT</aGr></w>
    w(sg('BLABLA'), ag('-', 'ṢU')), w(ag('ŠI', '-', 'PÁT'))
  ]);

  const line12 = "11 # šaṭ-rat°at° °MUNUS.MEŠ°kat°at°-re-eš {G: fünf Zeichen abgebr.} kar-°di°dim-mi-ia-az §§";
  const result12 = lineParseResult("11", [
    // <w>šaṭ-rat<SP___AO_3a_MaterLect>at</SP___AO_3a_MaterLect></w> <w><d>MUNUS.MEŠ</d>kat<SP___AO_3a_MaterLect>at</SP___AO_3a_MaterLect>-re-eš</w> <gap c="fünf Zeichen abgebr."/>
    w('šaṭ-rat', ml('at')), w(dt('MUNUS.MEŠ'), 'kat', ml('at'), '-re-eš'), w(aoGap('fünf Zeichen abgebr.')),
    // <w>kar-<SP___AO_3a_MaterLect>di</SP___AO_3a_MaterLect>dim-mi-ia-az</w> </s></p><parsep_dbl/><p><s>
    w('kar-', ml('di'), 'dim-mi-ia-az'), w(paragraphSeparatorDouble)
  ]);

  const line13 = "12 # GU4 ka4 ubx ub[x K]AxU §";
  const result13 = lineParseResult("12", [
    // <w><sGr>GU₄</sGr></w> <w>ka₄</w> <w>ubₓ</w> <w>ub<del_in/>ₓ</w> <w><sGr>K<del_fin/>A×U</sGr></w> </s></p><parsep/><p><s>
    w(sg('GU', id(4))), w('ka', id(4)), w('ub', id('x')), w('ub', ds, id('x')), w(sg('K', de, 'A', inscribedLetter('U'))), w(paragraphSeparator)
  ]);

  const line14 = "13 # 4 GU4";
  const result14 = lineParseResult("13", [
    // <w><num>4</num></w> <w><sGr>GU₄</sGr></w>
    w(nc('4')), w(sg('GU', id(4)))
  ]);

  const line15 = "14 # 4 GU4";
  const result15 = lineParseResult("14", [
    // <w><num>4</num></w> <w><sGr>GU₄</sGr></w>
    w('4', nc('4')), w('GU4', sg('GU', id(4)))
  ]);

  const line16 = "15 # DUB 2°KAM°";
  const result16 = lineParseResult("15", [
    // <w><sGr>DUB</sGr></w> <w><num>2</num><d>KAM</d></w>
    w('DUB', sg('DUB')), w('2°KAM°', nc('2'), dt('KAM'))
  ]);

  test.skip.each([
    [line01, result01], [line02, result02], [line03, result03], [line04, result04],
    [line05, result05], [line06, result06], [line07, result07], [line08, result08],
    [line09, result09], [line10, result10], [line11, result11], [line12, result12],
    [line13, result13], [line14, result14], [line15, result15], [line16, result16]
  ])(
    'should parse %p like SimTex as LineParseResult %s',
    (toParse, expectedResult) => expect(parseTransliterationLine(toParse)).toEqual(expectedResult)
  )

  const ownLine01 = "1' # [(x)] x ⸢zi⸣ x [";
  const ownResult01 = lineParseResult("1'", [
    w('[(x)]', ds, us, aoIllegibleContent, ue, de), w(aoIllegibleContent), w(ls, 'zi', le), w(aoIllegibleContent), w(ds)
  ]);

  const ownLine02 = "2' # [DUMU?].MUNUS?-ma e-ša-⸢a⸣-[ri";
  const ownResult02 = lineParseResult("2'", [
    w('[DUMU?].MUNUS?-ma', ds, sg('DUMU', uc, de, '.', 'MUNUS', uc), '-ma'),
    w('e-ša-⸢a⸣-[ri', 'e-ša-', ls, 'a', le, '-', ds, 'ri')
  ]);

  const ownLine03 = "3' # az-zi-ik-ki-it-[tén";
  const ownResult03 = lineParseResult("3'", [
    w('az-zi-ik-ki-it-[tén', 'az-zi-ik-ki-it-', ds, 'tén')
  ]);

  const ownLine04 = "4' # nu ḫu-u-ma-an az-[zi-ik-ki- ¬¬¬";
  const ownResult04 = lineParseResult("4'", [
    w('nu'), w('ḫu-u-ma-an'), w('az-', ds, 'zi-ik-ki-'), w(paragraphSeparator)
  ]);

  const ownLine05 = "5' # [k]u-it-ma-an-aš-ma x [";
  const ownResult05 = lineParseResult("5'", [
    w(ds, 'k', de, 'u-it-ma-an-aš-ma'), w(aoIllegibleContent), w(ds)
  ]);

  const ownLine06 = "6' # [n]a-aš-kán GIŠ.NÁ [";
  const ownResult06 = lineParseResult("6'", [
    w(ds, 'n', de, 'a-aš-kán'), w(sg('GIŠ.NÁ')), w(ds)
  ]);

  const ownLine07 = "7' # [nu-u]š-ši ša-aš-t[a-";
  const ownResult07 = lineParseResult("7'", [
    w(ds, 'nu-u', de, 'š-ši'), w('ša-aš-t', ds, 'a-')
  ]);

  const ownLine08 = "8' # [da?]-⸢a?⸣ nu-uš-ši x [";
  const ownResult08 = lineParseResult("8'", [
    w(ds, 'da', uc, de, '-', ls, 'a', uc, le), w('nu-uš-ši'), w(aoIllegibleContent), w(ds)
  ]);

  const ownLine09 = "9' # [nu-u]š-ši im-ma(-)[";
  const ownResult09 = lineParseResult("9'", [
    w(ds, 'nu-u', de, 'š-ši'), w('im-ma', us, '-', ue, ds)
  ]);

  const ownLine10 = "10' # [x-x]-TE°MEŠ° ⸢e⸣-[";
  const ownResult10 = lineParseResult("10'", [
    w(ds, 'x-x', de, ag('-', 'TE'), dt('MEŠ')), w(ls, 'e', le, '-', ds)
  ]);

  const ownLine11 = "11' # [x (x)]-ri-⸢ia⸣-[ ¬¬¬";
  const ownResult11 = lineParseResult("11'", [
    w(ds, aoIllegibleContent), w(us, aoIllegibleContent, ue, de, '-ri-', ls, 'ia', le, '-', ds), w(paragraphSeparator)
  ]);

  const ownLine12 = "12' # [x x] x [";
  const ownResult12 = lineParseResult("12'", [
    w(ds, 'x'), w('x', de), w(aoIllegibleContent), w(ds)
  ]);

  const ownLine13 = "1' # [ … ] x ¬¬¬";
  const ownResult13 = lineParseResult("1'", [
    w(ds), w(aoEllipsis), w(de), w(aoIllegibleContent), w(paragraphSeparator)
  ]);

  const ownLine14 = "2' # [ … °MUNUS.MEŠ°zi-i]n-tu-ḫi-e-eš";
  const ownResult14 = lineParseResult("2'", [
    w(ds), w(aoEllipsis), w(dt('MUNUS.MEŠ'), 'zi-i', de, 'n-tu-ḫi-e-eš')
  ]);

  const ownLine15 = "3' # [ … -i]a-u-an-zi tar-kum-mi-ia-iz-zi ¬¬¬";
  const ownResult15 = lineParseResult("3'", [
    w(ds), w(aoEllipsis), w('-i', de, 'a-u-an-zi'), w('tar-kum-mi-ia-iz-zi'), w(paragraphSeparator)
  ]);

  const ownLine16 = "4' # [ … °G]IŠ°BANŠUR °GIŠ°BANŠUR an-da";
  const ownResult16 = lineParseResult("4'", [
    w(ds), w(aoEllipsis), w(dt('G', de, 'IŠ'), ag('BANŠUR')), w(dt('GIŠ'), sg('BANŠUR')), w('an-da')
  ]);

  const ownLine17 = "5' # [ … ] ⸢6⸣ NINDA.GUR₄.RA°ḪI.A° ki-an-da";
  const ownResult17 = lineParseResult("5'", [
    w(ds), w(aoEllipsis), w(de), w(ls, nc('6'), le), w(sg('NINDA', '.', 'GUR', id(4), '.', 'RA'), dt('ḪI.A')), w('ki-an-da')
  ]);

  const ownLine18 = "6' # [ … -t]i-ia še-er pé-ra-an da-a-i ¬¬¬";
  const ownResult18 = lineParseResult("6'", [
    w(ds), w(aoEllipsis), w('-t', de, 'i-ia'), w('še-er'), w('pé-ra-an'), w('da-a-i'), w(paragraphSeparator)
  ]);

  const ownLine19 = "7' # [ … pé-r]a-an ḫu-u-wa-a-i";
  const ownResult19 = lineParseResult("7'", [
    w(ds), w(aoEllipsis), w('pé-r', de, 'a-an'), w('ḫu-u-wa-a-i')
  ]);

  const ownLine20 = "8' # [ … °MUNUS.MEŠ°zi]-⸢in-tu-ḫi⸣-e-eš an-da {Rasur}";
  const ownResult20 = lineParseResult("8'", [
    w(ds), w(aoEllipsis), w(dt('MUNUS.MEŠ'), 'zi', de, '-', ls, 'in-tu-ḫi', le, '-e-eš'), w('an-da'), w('{Rasur}')
  ]);

  const ownLine21 = "9' # [ú-wa-an-zi … k]i?-an-ta ¬¬¬";
  const ownResult21 = lineParseResult("9'", [
    w(ds, 'ú-wa-an-zi'), w(aoEllipsis), w('k', de, 'i', uc, '-an-ta'), w(paragraphSeparator)
  ]);

  const ownLine22 = "10' # [ … ] x-zi ¬¬¬";
  const ownResult22 = lineParseResult("10'", [
    w(ds), w(aoEllipsis), w(de), w('x-zi'), w(paragraphSeparator)
  ]);

  const ownLine23 = "11' # [ … ]-da";
  const ownResult23 = lineParseResult("11'", [
    w(ds), w(aoEllipsis), w(de, '-da')
  ]);

  const ownLine24 = "12' # [ … °LÚ°ALAM.Z]U₉";
  const ownResult24 = lineParseResult("12'", [
    w(ds), w(aoEllipsis), w(dt('LÚ'), sg('ALAM', '.', 'Z', de, 'U', id(9)))
  ]);

  const ownLine25 = "13' # [ … -z]i ¬¬¬";
  const ownResult25 = lineParseResult("13'", [
    w(ds), w(aoEllipsis), w('-z', de, 'i'), w(paragraphSeparator)
  ]);

  const ownLine26 = "1' # [x x] x x [ ¬¬¬";
  const ownResult26 = lineParseResult("1'", [
    w(ds, aoIllegibleContent), w(aoIllegibleContent, de), w(aoIllegibleContent), w(aoIllegibleContent), w(ds), w(paragraphSeparator)
  ]);

  const ownLine27 = "2' # LUGAL-uš GUB-[aš";
  const ownResult27 = lineParseResult("2'", [
    w(sg('LUGAL'), '-uš'), w(sg('GUB'), '-', ds, 'aš')
  ]);

  const ownLine28 = "3' # °D°UTU °D°U ⸢°D°⸣[";
  const ownResult28 = lineParseResult("3'", [
    w(dt('D'), sg('UTU')), w(dt('D'), sg('U')), w(ls, dt('D'), le, ds)
  ]);

  const ownLine29 = "4' # °D°zi-in-t[u-ḫi ¬¬¬";
  const ownResult29 = lineParseResult("4'", [
    w(dt('D'), 'zi-in-t', ds, 'u-ḫi'), w(paragraphSeparator)
  ]);

  const ownLine30 = "5' # °LÚ°SAGI.A 1 NINDA.G[UR₄.RA _EM-ṢA]";
  const ownResult30 = lineParseResult("5'", [
    w(dt('LÚ'), sg('SAGI', '.', 'A')), w(nc('1')), w(sg('NINDA', '.', 'G', ds, 'UR', id(4), '.', 'RA')), w(ag('EM', '-', 'ṢA'), de)
  ]);

  const ownLine31 = "6' # LUGAL-i pa-a-i LUGAL-u[š pár-ši-ia] ¬¬¬";
  const ownResult31 = lineParseResult("6'", [
    w(sg('LUGAL'), '-i'), w('pa-a-i'), w(sg('LUGAL'), '-u', ds, 'š'), w('pár-ši-ia', de), w(paragraphSeparator)
  ]);

  const ownLine32 = "7' # ta-aš-ta °MUNUS.MEŠ°zi-[in-tu-ḫi-e-eš";
  const ownResult32 = lineParseResult("7'", [
    w('ta-aš-ta'), w(dt('MUNUS.MEŠ'), 'zi-', ds, 'in-tu-ḫi-e-eš')
  ]);

  const ownLine33 = "8' # pa-ra-a [ ¬¬¬";
  const ownResult33 = lineParseResult("8'", [
    w('pa-ra-a'), w(ds), w(paragraphSeparator)
  ]);

  const ownLine34 = "9' # pár-aš-na-a-u-<aš>-kán °LÚ°SAG[I.A ¬¬¬";
  const ownResult34 = lineParseResult("9'", [
    w('pár-aš-na-a-u-', supS, 'aš', supE, '-kán'), w(dt('LÚ'), sg('SAG'), ds, sg('I', '.', 'A')), w(paragraphSeparator)
  ]);

  const ownLine35 = "10' # LUGAL-uš TUŠ-aš <°D°>iz-zi-i[š?-ta?-nu?";
  const ownResult35 = lineParseResult("10'", [
    w(sg('LUGAL'), '-uš'), w(sg('TUŠ'), '-aš'), w(supS, dt('D'), supE, 'iz-zi-i', ds, 'š', uc, '-ta', uc, '-nu', uc)
  ]);

  const ownLine36 = "11' # e-ku-zi GIŠ ⸢°D°⸣[INANNA ¬¬¬";
  const ownResult36 = lineParseResult("11'", [
    w('e-ku-zi'), w(sg('GIŠ')), w(ls, dt('D'), le, ds, sg('INANNA')), w(paragraphSeparator)
  ]);

  const ownLine37 = "12' # °LÚ°SAGI.A [1 NINDA.GUR₄.RA EM-ṢA]";
  const ownResult37 = lineParseResult("12'", [
    w(dt('LÚ'), sg('SAGI', '.', 'A')), w(ds, nc('1')), w(sg('NINDA.GUR'), nc('₄'), sg('.RA')), w(sg('EM'), ag('-ṢA'), de)
  ]);

  const ownLine38 = "13' # LUGAL-i pa-a-i [LUGAL-uš pár-ši-ia] ¬¬¬";
  const ownResult38 = lineParseResult("13'", [
    w(sg('LUGAL'), '-i'), w('pa-a-i'), w(ds, sg('LUGAL'), '-uš'), w('pár-ši-ia', de), w(paragraphSeparator)
  ]);

  const ownLine39 = "14' # GAL DUMU.MEŠ ⸢É⸣.[GAL";
  const ownResult39 = lineParseResult("14'", [
    w(sg('GAL')), w(sg('DUMU.MEŠ')), w(ls, sg('É'), le, sg('.'), ds, sg('GAL'))
  ]);

  const ownLine40 = "15' # °LÚ.MEŠ°GA[LA ¬¬¬";
  const ownResult40 = lineParseResult("15'", [
    w(dt('LÚ', '.', 'MEŠ'), sg('GA', ds, 'LA')), w(paragraphSeparator)
  ]);

  const ownLine41 = "16' # ⸢na-aš⸣-k[án";
  const ownResult41 = lineParseResult("16'", [
    w(ls, 'na-aš', le, '-k', ds, 'án')
  ]);

  const ownLine42 = "1 # a-na ša ki-ma | i-a-tí | ù! ku-li";
  const ownResult42 = lineParseResult("1", [
    w('a-na'), w('ša'), w('ki-ma'), w('|'), w('i-a-tí'), w('|'), w('ù', sc), w('ku-li')
  ]);

  const ownLine43 = "2 # a-na ku-li | qí-bi₄-ma | um-ma";
  const ownResult43 = lineParseResult("2", [
    w('a-na', 'a-na'),
    w('ku-li', 'ku-li'),
    w('|'),
    w('qí-bi₄-ma', 'qí-bi', nc('₄'), '-ma'),
    w('|'),
    w('um-ma', 'um-ma')
  ]);

  const ownLine44 = "3 # a-šùr-e-na-ma 2 MA.NA 2 ⅔ GÍN";
  const ownResult44 = lineParseResult("3", [
    w('a-šùr-e-na-ma'), w(nc('2')), w(sg('MA', '.', 'NA')), w(nc('2')), w('⅔'), w(sg('GÍN'))
  ]);

  const ownLine45 = "4 # KÙ.BABBAR | ša li-bi₄-kà | ša a-na MU 1.[ŠÈ]";
  const ownResult45 = lineParseResult("4", [
    w(sg('KÙ', '.', 'BABBAR')), w('|'), w('ša'), w('li-bi', nc('₄'), '-kà'), w('|'), w('ša'),
    w('a-na'), w(sg('MU')), w(/* TODO:, nc('1'), sg('.'), ds, sg('ŠÈ'), de*/)
  ]);

  const ownLine46 = "5 # ša-qá-lìm | qá-bi₄-a-tí-ni";
  const ownResult46 = lineParseResult("5", [
    w('ša-qá-lìm'), w('|'), w('qá-bi', nc('₄'), '-a-tí-ni')
  ]);

  const ownLine47 = "6 # ITI 1°KAM° | ku-zal-li | li-mu-um";
  const ownResult47 = lineParseResult("6", [
    w(sg('ITI')), w(nc('1'), dt('KAM')), w('|'), w('ku-zal-li'), w('|'), w('li-mu-um')
  ]);

  const ownLine48 = "7 # am-ri-iš₈-tár DUMU ma-num-ba-lúm-a-šùr";
  const ownResult48 = lineParseResult("7", [
    w('am-ri-iš', nc('₈'), '-tár'), w(sg('DUMU')), w('ma-num-ba-lúm-a-šùr')
  ]);

  const ownLine49 = "8 # i-na ṭup-pì-kà | a-šùr-mu-da-mì-i[q]";
  const ownResult49 = lineParseResult("8", [
    w('i-na'), w('ṭup-pì-kà'), w('|'), w('a-šùr-mu-da-mì-i', ds, 'q', de)
  ]);

  const ownLine50 = "9 # DUMU sá-ak-lá-nim | ⸢ú e⸣-dí-na-a";
  const ownResult50 = lineParseResult("9", [
    w(sg('DUMU')), w('sá-ak-lá-nim'), w('|'), w(ls, 'ú'), w('e', le, '-dí-na-a')
  ]);

  const ownLine51 = "10 # [DU]MU a-a-a | kà-an-ku-ni 1 GÍN KÙ.BABBAR";
  const ownResult51 = lineParseResult("10", [
    w(ds, sg('DU', de, 'MU')), w('a-a-a'), w('|'), w('kà-an-ku-ni'), w(nc('1')), w(sg('GÍN')), w(sg('KÙ', '.', 'BABBAR'))
  ]);

  const ownLine52 = "11 # lá tù-qá-ri-ba-am";
  const ownResult52 = lineParseResult("11", [w('lá'), w('tù-qá-ri-ba-am')
  ]);

  const ownLine53 = "12 # i-na °d°UTU-ši na-áš-pì-ir-⸢tí⸣";
  const ownResult53 = lineParseResult("12", [
    w('i-na'), w(ml('d'), sg('UTU'), '-ši'), w('na-áš-pì-ir-', ls, 'tí', le)
  ]);

  const ownLine54 = "13 # ta-ša-me-{Rasur}⸢ú⸣";
  const ownResult54 = lineParseResult("13", [
    w('ta-ša-me-{Rasur}⸢ú⸣')
  ]);

  // FIXME: lines with unknown features are commented out!
  test.each<[string, LineParseResult]>([
    [ownLine01, ownResult01], [ownLine02, ownResult02], [ownLine03, ownResult03], [ownLine04, ownResult04],
    [ownLine05, ownResult05], [ownLine06, ownResult06], [ownLine07, ownResult07], [ownLine08, ownResult08],
    [ownLine09, ownResult09], [ownLine10, ownResult10], [ownLine11, ownResult11], [ownLine12, ownResult12],
    [ownLine13, ownResult13], [ownLine14, ownResult14], [ownLine15, ownResult15], [ownLine16, ownResult16],
    [ownLine17, ownResult17], [ownLine18, ownResult18], [ownLine19, ownResult19], [ownLine20, ownResult20],
    [ownLine21, ownResult21], [ownLine22, ownResult22], [ownLine23, ownResult23], [ownLine24, ownResult24],
    [ownLine25, ownResult25], [ownLine26, ownResult26], [ownLine27, ownResult27], [ownLine28, ownResult28],
    [ownLine29, ownResult29], [ownLine30, ownResult30], [ownLine31, ownResult31], [ownLine32, ownResult32],
    [ownLine33, ownResult33], [ownLine34, ownResult34], [ownLine35, ownResult35], [ownLine36, ownResult36],
    /* [ownLine37, ownResult37],*/ [ownLine38, ownResult38], /*[ownLine39, ownResult39], [ownLine40, ownResult40],*/
    [ownLine41, ownResult41]/*, [ownLine42, ownResult42], [ownLine43, ownResult43], */ /*[ownLine44, ownResult44]*/,
    /* [ownLine45, ownResult45], [ownLine46, ownResult46], [ownLine47, ownResult47], */[ownLine48, ownResult48],
    /* [ownLine49, ownResult49], [ownLine50, ownResult50], [ownLine51, ownResult51], */[ownLine52, ownResult52],
    [ownLine53, ownResult53]/*, [ownLine54, ownResult54]*/
  ])(
    'should parse %p as LineParseResult %s',
    (toParse, expectedResult) => expect(parseTransliterationLine(toParse)).toEqual(expectedResult)
  );
});