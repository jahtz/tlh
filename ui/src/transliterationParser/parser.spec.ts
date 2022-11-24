import {LineParseResult, lineParseSuccess, parseTransliterationLine} from './lineParser';
import {parsedWord as w} from '../model/sentenceContent/word';
import {
  akkadogramm as ag,
  aoEllipsis,
  aoFootNote,
  aoIllegibleContent,
  aoKolonMark,
  del_fin,
  del_in,
  determinativ as dt,
  indexDigit as id,
  inscribedLetter,
  laes_fin,
  laes_in,
  materLectionis as ml,
  numeralContent as nc,
  ras_fin,
  ras_in,
  sumerogramm as sg
} from '../model/wordContent';
import {sc, uc} from './testHelpers';
import {paragraphSeparator, paragraphSeparatorDouble} from '../model/paragraphSeparator';

interface TestData {
  toParse: string;
  expected: LineParseResult;
}

describe('The transliteration parser should parse lines', () => {

  test.each<TestData>([
    {
      toParse: '1# ta LUGAL-uš A-NA DUTU AN-E x GUx.MAḪ pa-a-i {K:34}',
      expected: lineParseSuccess('1', [
        // <w>ta</w> <w><sGr>LUGAL</sGr>-uš</w> <w><sGr>A</sGr><aGr>-NA</aGr></w> <w><sGr>DUTU</sGr></w> <w><sGr>AN</sGr><aGr>-E</aGr></w>
        w('ta'), w(sg('LUGAL'), '-uš'), w(sg('A'), ag('-', 'NA')), w(sg('DUTU')), w(sg('AN'), ag('-', 'E')),
        // x <w><sGr>GUₓ.MAḪ</sGr></w> <w>pa-a-i</w> <w><SP___AO_3a_-KolonMark>K:34</SP___AO_3a_-KolonMark></w>
        w(aoIllegibleContent), w(sg('GU', id('x'), '.', 'MAḪ')), w('pa-a-i'), w(aoKolonMark('34'))
      ])
    },
    {
      toParse: '1\'# [ ... ] ⸢ú?-e?-te-na-an-za⸣',
      expected: lineParseSuccess('1\'', [
        // <w><del_in/></w> <w><sGr>...</sGr></w> <w><del_fin/></w> <w><laes_in/>ú<corr c='?'/>-e<corr c='?'/>-te-na-an-za<laes_fin/></w>
        w(del_in), w(aoEllipsis), w(del_fin), w(laes_in, 'ú', uc, '-e', uc, '-te-na-an-za', laes_fin)
      ])
    },
    {
      toParse: '2\'# [ ... ] ⸢nu⸣ LÚKÚR ku-e-da-ni pé-di',
      expected: lineParseSuccess(
        '2\'', [
          // <w><del_in/></w> <w><sGr>...</sGr></w> <w><del_fin/></w> <w><laes_in/>nu<laes_fin/></w> <w><sGr>LÚKÚR</sGr></w> <w>ku-e-da-ni</w> <w>pé-di</w>
          w(del_in), w(aoEllipsis), w(del_fin), w(laes_in, 'nu', laes_fin), w(sg('LÚKÚR')), w('ku-e-da-ni'), w('pé-di')
        ])
    },
    {
      toParse: '3\'# [ ... wa-ar-pa da-a]-iš* *na-aš-kán a-pé-e-ez',
      expected: lineParseSuccess('3\'', [
        // <w><del_in/></w> <w><sGr>...</sGr></w> <w>wa-ar-pa</w> <w>da-a<del_fin/>-iš<ras_in/></w> <w><ras_fin/>na-aš-kán</w> <w>a-pé-e-ez</w>
        w(del_in), w(aoEllipsis), w('wa-ar-pa'), w('da-a', del_fin, '-iš', ras_in), w('*na-aš-kán', ras_fin, 'na-aš-kán'), w('a-pé-e-ez', 'a-pé-e-ez')
      ])
    },
    {
      toParse: '4\'# [ ... mdu-ut-ḫa-l]i-ia-aš GAL ME-ŠE-DI',
      expected: lineParseSuccess('4\'', [
        // <w><del_in/></w> <w><sGr>...</sGr></w> <w>mdu-ut-ḫa-l<del_fin/>i-ia-aš</w> <w><sGr>GAL</sGr></w> <w><sGr>ME</sGr><aGr>-ŠE-DI</aGr></w>
        w(del_in), w(aoEllipsis), w('mdu-ut-ḫa-l', del_fin, 'i-ia-aš'), w(sg('GAL')), w(sg('ME'), ag('-', 'ŠE', '-', 'DI'))
      ])
    },
    {
      toParse: '5\'# [ ... -uš-m]a-⸢aš-ši⸣ ku-i-e-eš',
      expected: lineParseSuccess('5\'', [
        // <w><del_in/></w> <w><sGr>...</sGr></w> <w>-uš-m<del_fin/>a-<laes_in/>aš-ši<laes_fin/></w> <w>ku-i-e-eš</w>
        w(del_in), w(aoEllipsis), w('-uš-m', del_fin, 'a-', laes_in, 'aš-ši', laes_fin), w('ku-i-e-eš')
      ])
    },
    {
      toParse: '6\'# [ ... pa-ra-a] da-a-aš ¬¬¬',
      expected: lineParseSuccess(
        '6\'',
        [
          // <w><del_in/></w> <w><sGr>...</sGr></w> <w>pa-ra-a<del_fin/></w> <w>da-a-aš</w> </s></p><parsep/><p><s>
          w(del_in), w(aoEllipsis), w('pa-ra-a', del_fin), w('da-a-aš')
        ],
        paragraphSeparator
      )
    },
    {
      toParse: '7\'# [ ... ] x  °m°mur-ši--DINGIR-LIM °MUNUS°ŠU.GI LÚ°MEŠ° DINGIR°MEŠ°-aš',
      expected: lineParseSuccess('7\'', [
        // <w><del_in/></w> <w><sGr>...</sGr></w> <w><del_fin/></w> x <w><d>m</d>mur-ši-<sGr>DINGIR</sGr><aGr>-LIM</aGr></w>
        w(del_in), w(aoEllipsis), w(del_fin), w(aoIllegibleContent), w(dt('m'), 'mur-ši', sg('DINGIR'), ag('-', 'LIM')),
        // <w><d>MUNUS</d><sGr>ŠU.GI</sGr></w> <w><sGr>LÚ</sGr><d>MEŠ</d></w> <w><sGr>DINGIR</sGr><d>MEŠ</d>-aš</w>
        w(dt('MUNUS'), sg('ŠU', '.', 'GI')), w(sg('LÚ'), dt('MEŠ')), w(sg('DINGIR'), dt('MEŠ'), '-aš')
      ])
    },
    {
      toParse: '8\'# [ ] °m.D°30--SUM  ù °m.D°30--SUM{F: Problem mit den Punkten in Determinativen.}',
      expected: lineParseSuccess('8\'', [
        // <w><del_in/></w> <w><del_fin/></w> <w><d>m.D</d><sGr>30</sGr>-<sGr>SUM</sGr></w> <w>ù</w>
        w(del_in), w(del_fin), w(dt('m.D'), sg('30'), '-', sg('SUM')), w('ù'),
        // <w><SP___AO_3a_MaterLect>m.D</SP___AO_3a_MaterLect><num>30</num>-<sGr>SUM</sGr><note  n='1'  c="   &lt;P_f_Footnote&gt;Problem mit den Punkten in Determinativen.&lt;/P_f_Footnote&gt;"  /></w>
        w(dt('m.D'), nc('30'), '-', sg('SUM'), aoFootNote('Problem mit den Punkten in Determinativen.'))
      ])
    },
    {
      toParse: '9\' # °URU°?ša-mu-ḫa °URU°!ša-*mu-ḫa*   °URU?°ša?-mu-ḫa °URU!°ša-mu!-ḫa',
      expected: lineParseSuccess('9\'', [
        // <w><d>URU</d><corr c='?'/>ša-mu-ḫa</w> <w><d>URU</d><corr c='!'/>ša-<ras_in/>mu-ḫa<ras_fin/></w>
        w(dt('URU'), uc, 'ša-mu-ḫa'), w(dt('URU'), sc, 'ša-', ras_in, 'mu-ḫa', ras_in),
        // <w><SP___AO_3a_MaterLect>URU?</SP___AO_3a_MaterLect>ša<corr c='?'/>-mu-ḫa</w> <w><SP___AO_3a_MaterLect>URU!</SP___AO_3a_MaterLect>ša-mu<corr c='!'/>-ḫa</w>
        w(/*, TODO: ml('URU?'), ('ša'), uc, ('-mu-ḫa')*/), w( /* TODO:, ml('URU!'), ('ša-mu'), sc, ('-ḫa'))*/)
      ])
    },
    {
      toParse: '10 # BLABLA-ṢU _ŠI-PÁT',
      expected: lineParseSuccess('10', [
        // <w><sGr>BLABLA</sGr><aGr>-ṢU</aGr></w> <w><aGr>ŠI-PÁT</aGr></w>
        w(sg('BLABLA'), ag('-', 'ṢU')), w(ag('ŠI', '-', 'PÁT'))
      ])
    },
    {
      toParse: '11 # šaṭ-rat°at° °MUNUS.MEŠ°kat°at°-re-eš {G: fünf Zeichen abgebr.} kar-°di°dim-mi-ia-az §§',
      expected: lineParseSuccess(
        '11',
        [
          // <w>šaṭ-rat<SP___AO_3a_MaterLect>at</SP___AO_3a_MaterLect></w> <w><d>MUNUS.MEŠ</d>kat<SP___AO_3a_MaterLect>at</SP___AO_3a_MaterLect>-re-eš</w> <gap c="fünf Zeichen abgebr."/>
          w('šaṭ-rat', ml('at')), w(dt('MUNUS.MEŠ'), 'kat', ml('at'), '-re-eš'), w(/*aoGap('fünf Zeichen abgebr.')*/),
          // <w>kar-<SP___AO_3a_MaterLect>di</SP___AO_3a_MaterLect>dim-mi-ia-az</w> </s></p><parsep_dbl/><p><s>
          w('kar-', ml('di'), 'dim-mi-ia-az')
        ],
        paragraphSeparatorDouble)
    },
    {
      toParse: '12 # GU4 ka4 ubx ub[x K]AxU §',
      expected: lineParseSuccess(
        '12',
        [
          // <w><sGr>GU₄</sGr></w> <w>ka₄</w> <w>ubₓ</w> <w>ub<del_in/>ₓ</w> <w><sGr>K<del_fin/>A×U</sGr></w> </s></p><parsep/><p><s>
          w(sg('GU', id('4'))), w('ka', id('4')), w('ub', id('x')), w('ub', del_in, id('x')), w(sg('K', del_fin, 'A', inscribedLetter('U')))
        ],
        paragraphSeparator)
    },
    {
      toParse: '13 # 4 GU4',
      expected: lineParseSuccess('13', [
        // <w><num>4</num></w> <w><sGr>GU₄</sGr></w>
        w(nc('4')), w(sg('GU', id('4')))
      ])
    },
    {
      toParse: '14 # 4 GU4',
      expected: lineParseSuccess('14', [
        // <w><num>4</num></w> <w><sGr>GU₄</sGr></w>
        w('4', nc('4')), w('GU4', sg('GU', id('4')))
      ])
    },
    {
      toParse: '15 # DUB 2°KAM°',
      expected: lineParseSuccess('15', [
        // <w><sGr>DUB</sGr></w> <w><num>2</num><d>KAM</d></w>
        w('DUB', sg('DUB')), w('2°KAM°', nc('2'), dt('KAM'))
      ])
    }
  ])(
    '(0-$#) should parse "$toParse" like SimTex as LineParseResult $expected',
    ({toParse, expected}) => expect(parseTransliterationLine(toParse)).toEqual(expected)
  );

  test.each<TestData>([
    {
      toParse: '1\' # [(x)] x ⸢zi⸣ x [',
      expected: lineParseSuccess('1\'', [w(del_in, '(', aoIllegibleContent, ')', del_fin), w(aoIllegibleContent), w(laes_in, 'zi', laes_fin), w(aoIllegibleContent), w(del_in)])
    },
    {
      toParse: '2\' # [DUMU?].MUNUS?-ma e-ša-⸢a⸣-[ri',
      expected: lineParseSuccess('2\'', [w(del_in, sg('DUMU', uc, del_fin, '.', 'MUNUS', uc), '-ma'), w('e-ša-', laes_in, 'a', laes_fin, '-', del_in, 'ri')])
    },
    {
      toParse: '3\' # az-zi-ik-ki-it-[tén',
      expected: lineParseSuccess('3\'', [w('az-zi-ik-ki-it-', del_in, 'tén')])
    },
    {
      toParse: '4\' # nu ḫu-u-ma-an az-[zi-ik-ki- ¬¬¬',
      expected: lineParseSuccess('4\'', [w('nu'), w('ḫu-u-ma-an'), w('az-', del_in, 'zi-ik-ki-'), w(/*paragraphSeparator*/)])
    },
    {
      toParse: '5\' # [k]u-it-ma-an-aš-ma x [',
      expected: lineParseSuccess('5\'', [w(del_in, 'k', del_fin, 'u-it-ma-an-aš-ma'), w(aoIllegibleContent), w(del_in)])
    },
    {
      toParse: '6\' # [n]a-aš-kán GIŠ.NÁ [',
      expected: lineParseSuccess('6\'', [w(del_in, 'n', del_fin, 'a-aš-kán'), w(sg('GIŠ', '.', 'NÁ')), w(del_in)])
    },
    {
      toParse: '7\' # [nu-u]š-ši ša-aš-t[a-',
      expected: lineParseSuccess('7\'', [w(del_in, 'nu-u', del_fin, 'š-ši'), w('ša-aš-t', del_in, 'a-')])
    },
    {
      toParse: '8\' # [da?]-⸢a?⸣ nu-uš-ši x [',
      expected: lineParseSuccess('8\'', [
        w(del_in, 'da', uc, del_fin, '-', laes_in, 'a', uc, laes_fin), w('nu-uš-ši'), w(aoIllegibleContent), w(del_in)
      ])
    },
    {
      toParse: '9\' # [nu-u]š-ši im-ma(-)[',
      expected: lineParseSuccess('9\'', [w(del_in, 'nu-u', del_fin, 'š-ši'), w('im-ma', '(', '-', ')', del_in)])
    },
    {
      toParse: '10\' # [x-x]-TE°MEŠ° ⸢e⸣-[',
      expected: lineParseSuccess('10\'', [w(del_in, 'x-x', del_fin, ag('-', 'TE'), dt('MEŠ')), w(laes_in, 'e', laes_fin, '-', del_in)])
    },
    {
      toParse: '11\' # [x (x)]-ri-⸢ia⸣-[ ¬¬¬',
      expected: lineParseSuccess('11\'', [w(del_in, aoIllegibleContent), w('(', aoIllegibleContent, ')', del_fin, '-ri-', laes_in, 'ia', laes_fin, '-', del_in), w(/*paragraphSeparator*/)])
    },
    {
      toParse: '12\' # [x x] x [',
      expected: lineParseSuccess('12\'', [w(del_in, 'x'), w('x', del_fin), w(aoIllegibleContent), w(del_in)])
    },
    {
      toParse: '1\' # [ … ] x ¬¬¬',
      expected: lineParseSuccess('1\'', [w(del_in), w(aoEllipsis), w(del_fin), w(aoIllegibleContent), w(/*paragraphSeparator*/)])
    },
    {
      toParse: '2\' # [ … °MUNUS.MEŠ°zi-i]n-tu-ḫi-e-eš',
      expected: lineParseSuccess('2\'', [w(del_in), w(aoEllipsis), w(dt('MUNUS.MEŠ'), 'zi-i', del_fin, 'n-tu-ḫi-e-eš')])
    },
    {
      toParse: '3\' # [ … -i]a-u-an-zi tar-kum-mi-ia-iz-zi ¬¬¬',
      expected: lineParseSuccess('3\'', [w(del_in), w(aoEllipsis), w('-i', del_fin, 'a-u-an-zi'), w('tar-kum-mi-ia-iz-zi'), w(/*paragraphSeparator*/)])
    },
    {
      toParse: '4\' # [ … °G]IŠ°BANŠUR °GIŠ°BANŠUR an-da',
      expected: lineParseSuccess('4\'', [w(del_in), w(aoEllipsis), w(dt('G', del_fin, 'IŠ'), ag('BANŠUR')), w(dt('GIŠ'), sg('BANŠUR')), w('an-da')])
    },
    {
      toParse: '5\' # [ … ] ⸢6⸣ NINDA.GUR₄.RA°ḪI.A° ki-an-da',
      expected: lineParseSuccess('5\'', [w(del_in), w(aoEllipsis), w(del_fin), w(laes_in, nc('6'), laes_fin), w(sg('NINDA', '.', 'GUR', id('4'), '.', 'RA'), dt('ḪI.A')), w('ki-an-da')])
    },
    {
      toParse: '6\' # [ … -t]i-ia še-er pé-ra-an da-a-i ¬¬¬',
      expected: lineParseSuccess('6\'', [w(del_in), w(aoEllipsis), w('-t', del_fin, 'i-ia'), w('še-er'), w('pé-ra-an'), w('da-a-i'), w(/*paragraphSeparator*/)])
    },
    {
      toParse: '7\' # [ … pé-r]a-an ḫu-u-wa-a-i',
      expected: lineParseSuccess('7\'', [w(del_in), w(aoEllipsis), w('pé-r', del_fin, 'a-an'), w('ḫu-u-wa-a-i')])
    },
    {
      toParse: '8\' # [ … °MUNUS.MEŠ°zi]-⸢in-tu-ḫi⸣-e-eš an-da {Rasur}',
      expected: lineParseSuccess('8\'', [
        w(del_in), w(aoEllipsis), w(dt('MUNUS.MEŠ'), 'zi', del_fin, '-', laes_in, 'in-tu-ḫi', laes_fin, '-e-eš'), w('an-da'), w('{Rasur}')
      ])
    },
    {
      toParse: '9\' # [ú-wa-an-zi … k]i?-an-ta ¬¬¬',
      expected: lineParseSuccess('9\'', [w(del_in, 'ú-wa-an-zi'), w(aoEllipsis), w('k', del_fin, 'i', uc, '-an-ta'), w(/*paragraphSeparator*/)])
    },
    {
      toParse: '10\' # [ … ] x-zi ¬¬¬',
      expected: lineParseSuccess('10\'', [w(del_in), w(aoEllipsis), w(del_fin), w('x-zi'), w(/*paragraphSeparator*/)])
    },
    {
      toParse: '11\' # [ … ]-da',
      expected: lineParseSuccess('11\'', [w(del_in), w(aoEllipsis), w(del_fin, '-da')])
    },
    {
      toParse: '12\' # [ … °LÚ°ALAM.Z]U₉',
      expected: lineParseSuccess('12\'', [w(del_in), w(aoEllipsis), w(dt('LÚ'), sg('ALAM', '.', 'Z', del_fin, 'U', id('9')))])
    },
    {
      toParse: '13\' # [ … -z]i ¬¬¬',
      expected: lineParseSuccess('13\'', [w(del_in), w(aoEllipsis), w('-z', del_fin, 'i')], paragraphSeparator)
    },
    {
      toParse: '1\' # [x x] x x [ ¬¬¬',
      expected: lineParseSuccess('1\'', [w(del_in, aoIllegibleContent), w(aoIllegibleContent, del_fin), w(aoIllegibleContent), w(aoIllegibleContent), w(del_in)], paragraphSeparator)
    },
    {
      toParse: '2\' # LUGAL-uš GUB-[aš',
      expected: lineParseSuccess('2\'', [w(sg('LUGAL'), '-uš'), w(sg('GUB'), '-', del_in, 'aš')])
    },
    {
      toParse: '3\' # °D°UTU °D°U ⸢°D°⸣[',
      expected: lineParseSuccess('3\'', [w(dt('D'), sg('UTU')), w(dt('D'), sg('U')), w(laes_in, dt('D'), laes_fin, del_in)])
    },
    {
      toParse: '4\' # °D°zi-in-t[u-ḫi ¬¬¬',
      expected: lineParseSuccess('4\'', [w(dt('D'), 'zi-in-t', del_in, 'u-ḫi')], paragraphSeparator)
    },
    {
      toParse: '5\' # °LÚ°SAGI.A 1 NINDA.G[UR₄.RA _EM-ṢA]',
      expected: lineParseSuccess('5\'', [
        w(dt('LÚ'), sg('SAGI', '.', 'A')), w(nc('1')), w(sg('NINDA', '.', 'G', del_in, 'UR', id('4'), '.', 'RA')), w(ag('EM', '-', 'ṢA'), del_fin)
      ])
    },
    {
      toParse: '6\' # LUGAL-i pa-a-i LUGAL-u[š pár-ši-ia] ¬¬¬',
      expected: lineParseSuccess('6\'', [w(sg('LUGAL'), '-i'), w('pa-a-i'), w(sg('LUGAL'), '-u', del_in, 'š'), w('pár-ši-ia', del_fin)], paragraphSeparator)
    },
    {
      toParse: '7\' # ta-aš-ta °MUNUS.MEŠ°zi-[in-tu-ḫi-e-eš',
      expected: lineParseSuccess('7\'', [w('ta-aš-ta'), w(dt('MUNUS.MEŠ'), 'zi-', del_in, 'in-tu-ḫi-e-eš')])
    },
    {
      toParse: '8\' # pa-ra-a [ ¬¬¬',
      expected: lineParseSuccess('8\'', [w('pa-ra-a'), w(del_in), w(/*paragraphSeparator*/)])
    },
    {
      toParse: '9\' # pár-aš-na-a-u-<aš>-kán °LÚ°SAG[I.A ¬¬¬',
      expected: lineParseSuccess('9\'', [w('pár-aš-na-a-u-', '<', 'aš', '>', '-kán'), w(dt('LÚ'), sg('SAG'), del_in, sg('I', '.', 'A'))], paragraphSeparator)
    },
    {
      toParse: '10\' # LUGAL-uš TUŠ-aš <°D°>iz-zi-i[š?-ta?-nu?',
      expected: lineParseSuccess('10\'', [
        w(sg('LUGAL'), '-uš'), w(sg('TUŠ'), '-aš'), w('<', dt('D'), '>', 'iz-zi-i', del_in, 'š', uc, '-ta', uc, '-nu', uc)
      ])
    },
    {
      toParse: '11\' # e-ku-zi GIŠ ⸢°D°⸣[INANNA ¬¬¬',
      expected: lineParseSuccess('11\'', [w('e-ku-zi'), w(sg('GIŠ')), w(laes_in, dt('D'), laes_fin, del_in, sg('INANNA'))], paragraphSeparator)
    },
    {
      toParse: '12\' # °LÚ°SAGI.A [1 NINDA.GUR₄.RA EM-ṢA]',
      expected: lineParseSuccess('12\'', [
        w(dt('LÚ'), sg('SAGI', '.', 'A')), w(del_in, nc('1')), w(sg('NINDA.GUR'), nc('₄'), sg('.RA')), w(sg('EM'), ag('-ṢA'), del_fin)
      ])
    },
    {
      toParse: '13\' # LUGAL-i pa-a-i [LUGAL-uš pár-ši-ia] ¬¬¬',
      expected: lineParseSuccess('13\'', [w(sg('LUGAL'), '-i'), w('pa-a-i'), w(del_in, sg('LUGAL'), '-uš'), w('pár-ši-ia', del_fin)], paragraphSeparator)
    },
    {
      toParse: '14\' # GAL DUMU.MEŠ ⸢É⸣.[GAL',
      expected: lineParseSuccess('14\'', [
        w(sg('GAL')), w(sg('DUMU.MEŠ')), w(laes_in, sg('É'), laes_fin, sg('.'), del_in, sg('GAL'))
      ])
    },
    {
      toParse: '15\' # °LÚ.MEŠ°GA[LA ¬¬¬',
      expected: lineParseSuccess('15\'', [w(dt('LÚ', '.', 'MEŠ'), sg('GA', del_in, 'LA'))], paragraphSeparator)
    },
    {
      toParse: '16\' # ⸢na-aš⸣-k[án',
      expected: lineParseSuccess('16\'', [w(laes_in, 'na-aš', laes_fin, '-k', del_in, 'án')])
    },
    {
      toParse: '1 # a-na ša ki-ma | i-a-tí | ù! ku-li',
      expected: lineParseSuccess('1', [
        w('a-na'), w('ša'), w('ki-ma'), w('|'), w('i-a-tí'), w('|'), w('ù', sc), w('ku-li')
      ])
    },
    {
      toParse: '2 # a-na ku-li | qí-bi₄-ma | um-ma',
      expected: lineParseSuccess('2', [
        w('a-na', 'a-na'),
        w('ku-li', 'ku-li'),
        w('|'),
        w('qí-bi₄-ma', 'qí-bi', nc('₄'), '-ma'),
        w('|'),
        w('um-ma', 'um-ma')
      ])
    },
    {
      toParse: '3 # a-šùr-e-na-ma 2 MA.NA 2 ⅔ GÍN',
      expected: lineParseSuccess('3', [
        w('a-šùr-e-na-ma'), w(nc('2')), w(sg('MA', '.', 'NA')), w(nc('2')), w('⅔'), w(sg('GÍN'))
      ])
    },
    {
      toParse: '4 # KÙ.BABBAR | ša li-bi₄-kà | ša a-na MU 1.[ŠÈ]',
      expected: lineParseSuccess('4', [
        w(sg('KÙ', '.', 'BABBAR')), w('|'), w('ša'), w('li-bi', nc('₄'), '-kà'), w('|'), w('ša'),
        w('a-na'), w(sg('MU')), w(/* TODO:, nc('1'), sg('.'), ds, sg('ŠÈ'), de*/)
      ])
    },
    {
      toParse: '5 # ša-qá-lìm | qá-bi₄-a-tí-ni',
      expected: lineParseSuccess('5', [
        w('ša-qá-lìm'), w('|'), w('qá-bi', nc('₄'), '-a-tí-ni')
      ])
    },
    {
      toParse: '6 # ITI 1°KAM° | ku-zal-li | li-mu-um',
      expected: lineParseSuccess('6', [
        w(sg('ITI')), w(nc('1'), dt('KAM')), w('|'), w('ku-zal-li'), w('|'), w('li-mu-um')
      ])
    },
    {
      toParse: '7 # am-ri-iš₈-tár DUMU ma-num-ba-lúm-a-šùr',
      expected: lineParseSuccess('7', [
        w('am-ri-iš', nc('₈'), '-tár'), w(sg('DUMU')), w('ma-num-ba-lúm-a-šùr')
      ])
    },
    {
      toParse: '8 # i-na ṭup-pì-kà | a-šùr-mu-da-mì-i[q]',
      expected: lineParseSuccess('8', [
        w('i-na'), w('ṭup-pì-kà'), w('|'), w('a-šùr-mu-da-mì-i', del_in, 'q', del_fin)
      ])
    },
    {
      toParse: '9 # DUMU sá-ak-lá-nim | ⸢ú e⸣-dí-na-a',
      expected: lineParseSuccess('9', [
        w(sg('DUMU')), w('sá-ak-lá-nim'), w('|'), w(laes_in, 'ú'), w('e', laes_fin, '-dí-na-a')
      ])
    },
    {
      toParse: '10 # [DU]MU a-a-a | kà-an-ku-ni 1 GÍN KÙ.BABBAR',
      expected: lineParseSuccess('10', [
        w(del_in, sg('DU', del_fin, 'MU')), w('a-a-a'), w('|'), w('kà-an-ku-ni'), w(nc('1')), w(sg('GÍN')), w(sg('KÙ', '.', 'BABBAR'))
      ])
    },
    {
      toParse: '11 # lá tù-qá-ri-ba-am',
      expected: lineParseSuccess('11', [w('lá'), w('tù-qá-ri-ba-am')
      ])
    },
    {
      toParse: '12 # i-na °d°UTU-ši na-áš-pì-ir-⸢tí⸣',
      expected: lineParseSuccess('12', [
        w('i-na'), w(ml('d'), sg('UTU'), '-ši'), w('na-áš-pì-ir-', laes_in, 'tí', laes_fin)
      ])
    },
    {
      toParse: '13 # ta-ša-me-{Rasur}⸢ú⸣',
      expected: lineParseSuccess('13', [
        w('ta-ša-me-{Rasur}⸢ú⸣')
      ])
    }
  ])(
    'should parse (1-$#) "$toParse" as $expected',
    ({toParse, expected}) => expect(parseTransliterationLine(toParse)).toEqual(expected)
  );
});