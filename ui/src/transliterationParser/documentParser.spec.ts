import {LineParseResult, lineParseSuccess, parseTransliterationLine} from './lineParser';
import {parsedWord as w} from '../model/sentenceContent/word';
import {
  akkadogramm as ag,
  aoIllegibleContent as illeg,
  del_fin,
  del_in,
  determinativ as d,
  indexDigit,
  laes_fin,
  laes_in,
  numeralContent as nc,
  sumerogramm as sg
} from '../model/wordContent';
import {paragraphSeparator} from '../model/paragraphSeparator';

const completeInput = `
$Publikationsnummer: KBo 71.53, Grabungsnummer: Bo 2018/6, Paläographische Klassifizierung: junghethitisch
%Vs. III
%Rs. IV
1' # [ ... -i]a [(x)]
2' # [ ... ] x EGIR-⸢pa⸣
3' # [°GIŠ°BANŠU]R?-i da-a-i
4' # [ḫe-ú-un tar-n]a(?)-an-zi
5' # [pár-aš-n]a-u-wa-aš
6' # [°LÚ°SAGI.A] ú-ez-zi
7' # [DUMU°MEŠ°.É.GAL g]e-nu-wa-aš GADA°ḪI.A°
8' # [ú-da-an]-zi §
9' # [LUGAL MU]NUS.LUGAL GUB-aš °D°UTU °D°me-zu-ul-la
10' # [a-ku-w]a-an-zi GIŠ.°D°INANNA GAL
11' # [°LÚ].MEŠ°ḫal-li-ia-ri-eš SÌR-RU
12' # °LÚ°ALAM.ZU9 me-ma-i
13' # °LÚ°ki-i-ta-aš ḫal-za-i
14' # °LÚ°SAGI.A-aš 1 NINDA.GUR4.RA [_EM-ṢA]
{G:Rs. IV endet}
%Rs. V
1' # me-ek-ki a-ru-um!-ma uš-kat°at°-tén{F:Diese und die folgenden Zeilen sind frei erfunden und dienen der Überprüfung von seltenen Auszeichnungen.}
2' # ke-e <<e>> udsic-da-a-ar °m°°.°°LÚ°_DA-A-A-NI--DINGIR a-<ni>-ia-at {S:ḪAL} §§
3' # *{G:(Rasur)}* ><  ><  >< °LÚ°DUB.SAR-aš-ma KAxU-az °ḫu°ḫur-lix-lix ki-iš-ša-an me-ma-an-zi
@Hur
4' # ge-e-lu te-ia wa|a-aḫ-ru-wa|a-a-ti wu|ú-ut-ki °D°a-ni-we|e
@Hit
5' # _I-NA UD 2°KAM° ; ta-aš-ši-wa-at-ti _ŠA °D°_IŠTAR : °TÚG°pa-la-aḫ-ša-an še-e-er e-ep
@Sum
6' # lugal °D°iškur gú-gal-kalam-ma
@Hit
7' # zi-ik @s za-e @a at-ta @p ti-i @l ti-i @ha we|e @hu bi-e-eš
{G:Die folgenden Zeilen sind auf der Tafel als Tabelle formatiert}
8' # {S:ḪU} \\ @s mu-še-en \\ @a iṣ-ṣu-rum \\ @h šu-wa-iš
9' # {S:KALxBAD} \\ @s a-la-ad \\ @a še-e-du \\ @h tar-pí-iš
10' # {S:NIM} \\ @s ni-im \\ @a ša-qú-ú \\ @h pár-ku-uš
{G:Hier endet der frei erfundene Text}
`;

const completeResult = `
<?xml-stylesheet href="HPMxml.css" type="text/css"?>
<AOxml    xmlns:hpm="http://hethiter.net/ns/hpm/1.0" xmlns:AO="http://hethiter.net/ns/AO/1.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" >
<AOHeader>
<docID>KBo 71.53</docID>
<meta><creation-date date='2016-04-15T16:55:36.58'/><kor2 date='2021-05-07T00:00:13'/><AOxml-creation date='2021-05-07T00:00:13' /><annotation> <annot editor='auto' date=''/> <annot editor='' date=''/></annotation></meta>
</AOHeader><body> <div1 type='transliteration'> <text xml:lang='XXXlang'> <p> <s xml:lang='XXXlang'>
<AO:Manuscripts><AO:TxtPubl>KBo 71.53</AO:TxtPubl> </AO:Manuscripts>
<lb txtid="KBo 71.53" lnr="Rs. IV 1′" lg="Hit"/> <w><del_in/></w> <w><sGr>..</sGr></w> <w>-i<del_fin/>a</w> <w><del_in/>(x)<del_fin/></w>  
<lb txtid="KBo 71.53" lnr="Rs. IV 2′" lg="Hit"/> <w><del_in/></w> <w><sGr>..</sGr></w> <w><del_fin/></w> <w>x</w> <w><sGr>EGIR</sGr>-<laes_in/>pa<laes_fin/></w>  
<lb txtid="KBo 71.53" lnr="Rs. IV 3′" lg="Hit"/> <w><del_in/><d>GIŠ</d><sGr>BANŠU<del_fin/>R</sGr><corr c='?'/>-i</w> <w>da-a-i</w>  
<lb txtid="KBo 71.53" lnr="Rs. IV 4′" lg="Hit"/> <w><del_in/>ḫe-ú-un</w> <w>tar-n<del_fin/>a<corr c='(?)'/>-an-zi</w>  
<lb txtid="KBo 71.53" lnr="Rs. IV 5′" lg="Hit"/> <w><del_in/>pár-aš-n<del_fin/>a-u-wa-aš</w>  
<lb txtid="KBo 71.53" lnr="Rs. IV 6′" lg="Hit"/> <w><del_in/><d>LÚ</d><sGr>SAGI.A<del_fin/></sGr></w> <w>ú-ez-zi</w>  
<lb txtid="KBo 71.53" lnr="Rs. IV 7′" lg="Hit"/> <w><sGr><del_in/>DUMU</sGr><d>MEŠ</d><sGr>.É.GAL</sGr></w> <w>g<del_fin/>e-nu-wa-aš</w> <w><sGr>GADA</sGr><d>ḪI.A</d></w>  
<lb txtid="KBo 71.53" lnr="Rs. IV 8′" lg="Hit"/> <w><del_in/>ú-da-an<del_fin/>-zi</w> </s></p><parsep/><p><s>  
<lb txtid="KBo 71.53" lnr="Rs. IV 9′" lg="Hit"/> <w><sGr><del_in/>LUGAL</sGr></w> <w><sGr>MU<del_fin/>NUS.LUGAL</sGr></w> <w><sGr>GUB</sGr>-aš</w> <w><d>D</d><sGr>UTU</sGr></w> <w><d>D</d>me-zu-ul-la</w>  
<lb txtid="KBo 71.53" lnr="Rs. IV 10′" lg="Hit"/> <w><del_in/>a-ku-w<del_fin/>a-an-zi</w> <w><sGr>GIŠ</sGr>.<d>D</d><sGr>INANNA</sGr></w> <w><sGr>GAL</sGr></w>  
<lb txtid="KBo 71.53" lnr="Rs. IV 11′" lg="Hit"/> <w><del_in/><d>LÚ<del_fin/>.MEŠ</d>ḫal-li-ia-ri-eš</w> <w><sGr>SÌR</sGr><aGr>-RU</aGr></w>  
<lb txtid="KBo 71.53" lnr="Rs. IV 12′" lg="Hit"/> <w><d>LÚ</d><sGr>ALAM.ZU₉</sGr></w> <w>me-ma-i</w>  
<lb txtid="KBo 71.53" lnr="Rs. IV 13′" lg="Hit"/> <w><d>LÚ</d>ki-i-ta-aš</w> <w>ḫal-za-i</w>  
<lb txtid="KBo 71.53" lnr="Rs. IV 14′" lg="Hit"/> <w><d>LÚ</d><sGr>SAGI.A</sGr>-aš</w> <w><num>1</num></w> <w><sGr>NINDA.GUR₄.RA</sGr></w> <w><aGr><del_in/>EM-ṢA<del_fin/></aGr></w>  
<gap t="line" c="Rs. IV endet"/> 
<lb txtid="KBo 71.53" lnr="Rs. V 1′" lg="Hit"/> <w>me-ek-ki</w> <w>a-ru-um<corr c='!'/>-ma</w> <w>uš-kat<materlect c='at'/>-tén</w> <w><note  c="&lt;P_f_&gt;Diese und die folgenden Zeilen sind frei erfunden und dienen der Überprüfung von seltenen Auszeichnungen&lt;/P_f_&gt;"  /></w>  
<lb txtid="KBo 71.53" lnr="Rs. V 2′" lg="Hit"/> <w>ke-e</w> <w>〈〈e〉〉</w> <w>ud<corr c='sic'/>-da-a-ar</w> <w><d>m.LÚ</d><aGr>DA-A-A-NI</aGr>-<sGr>DINGIR</sGr></w> <w>a-〈ni〉-ia-at</w> <w><c type='sign'>ḪAL</c></w> </s></p><parsep_dbl/><p><s>  
<lb txtid="KBo 71.53" lnr="Rs. V 3′" lg="Hit"/> <w><sGr><ras_in/></sGr><gap c="(Rasur)"/><sGr><ras_fin/></sGr></w> <w>𒉽</w> <w>𒉽</w> <w>𒉽</w> <w><d>LÚ</d><sGr>DUB.SAR</sGr>-aš-ma</w> <w><sGr>KA×U</sGr>-az</w> <w><materlect c='ḫu'/>ḫur-liₓ-liₓ</w> <w>ki-iš-ša-an</w> <w>me-ma-an-zi</w>  
<lb txtid="KBo 71.53" lnr="Rs. V 4′" lg="Hur"/> <w>ge-e-lu</w> <w>te-ia</w> <w>wa<subscr c="a"/>-aḫ-ru-wa<subscr c="a"/>-a-ti</w> <w>wu<subscr c="ú"/>-ut-ki</w> <w><d>D</d>a-ni-we<subscr c="e"/></w>  
<lb txtid="KBo 71.53" lnr="Rs. V 5′" lg="Hit"/> <w><aGr>I-NA</aGr></w> <w><sGr>UD</sGr></w> <w><num>2</num><d>KAM</d></w> <w>𒀹</w> <w>ta-aš-ši-wa-at-ti</w> <w><aGr>ŠA</aGr></w> <w><d>D</d><aGr>IŠTAR</aGr></w> <w>𒑱</w> <w><d>TÚG</d>pa-la-aḫ-ša-an</w> <w>še-e-er</w> <w>e-ep</w>  
<lb txtid="KBo 71.53" lnr="Rs. V 6′" lg="Hit"/> <w>zi-ik</w> <w lg='Sum'>za-e</w> <w lg='Akk'>at-ta</w> <w lg='Pal'>ti-i</w> <w lg='Luw'>ti-i</w> <w>we<subscr c="e"/></w> <w lg='Hur'>bi-e-eš</w>  
<gap t="line" c="Die folgenden Zeilen sind auf der Tafel als Tabelle formatiert"/> 
<lb txtid="KBo 71.53" lnr="Rs. V 7′" lg="Hit"/> <w><c type='sign'>ḪU</c></w> <tabsep/> <w lg='Sum'>mu-še-en</w> <tabsep/> <w lg='Akk'>iṣ-ṣu-rum</w> <tabsep/> <w>šu-wa-iš</w>  
<lb txtid="KBo 71.53" lnr="Rs. V 8′" lg="Hit"/> <w><c type='sign'>KAL×BAD</c></w> <tabsep/> <w lg='Sum'>a-la-ad</w> <tabsep/> <w lg='Akk'>še-e-du</w> <tabsep/> <w>tar-pí-iš</w>  
<lb txtid="KBo 71.53" lnr="Rs. V 9′" lg="Hit"/> <w><c type='sign'>NIM</c></w> <tabsep/> <w lg='Sum'>ni-im</w> <tabsep/> <w lg='Akk'>ša-qú-ú</w> <tabsep/> <w>pár-ku-uš</w>  
<gap t="line" c="Hier endet der frei erfundene Text"/> 
</s></p></text></div1></body></AOxml>
`;

interface TestData {
  toParse: string;
  expected: LineParseResult;
}

/**
 * TODO: deactivated because of (build breaking) errors
 */
describe('DocumentParser', () => {

  test.each<TestData>([
    {
      toParse: '1 # ti-e-ez-zi nu LÚ°MEŠ° x [x x (x)]',
      //
      expected: lineParseSuccess('1', [w('ti-e-ez-zi'), w('nu'), w(sg('LÚ'), d('MEŠ')), w(illeg), w(del_in, illeg), w(illeg), w('(', illeg, ')', del_fin)])
    },
    {
      toParse: '2 # ḫa-an-te-ez-zi ti-an-zi',
      expected: lineParseSuccess('2', [w('ḫa-an-te-ez-zi'), w('ti-an-zi')]),
    },
    {
      toParse: '3 # _IT-TI GUNNI-at a-ra-an-zi',
      expected: lineParseSuccess('3', [w(ag('IT', '-', 'TI')), w(sg('GUNNI', '-', 'at')), w('a-ra-an-zi')])
    },
    {
      toParse: '4 # [n]a-at-kán GUNNI pé-ra-an ar-ḫa',
      expected: lineParseSuccess('4', [w(del_in, 'n', del_fin, 'a-at-kán'), w(sg('GUNNI')), w('pé-ra-an'), w('ar-ḫa')])
    },
    {
      toParse: '5 # [pa-a]n-zi 1 °MUN°pu-ú-ti-in',
      expected: lineParseSuccess('5', [w(del_in, 'pa-a', del_fin, 'n-zi'), w(nc('1')), w(d('MUN'), 'pu-ú-ti-in')])
    },
    {
      toParse: '6 # [x x] x ḫa-an-te-ez-zi še-er',
      expected: lineParseSuccess('6', [w(del_in, illeg), w(illeg, del_fin), w(illeg), w('ḫa-an-te-ez-zi'), w('še-er')])
    },
    {
      toParse: '7 # [x x x x]-nu-zi §',
      expected: lineParseSuccess('7', [w(del_in, illeg), w(illeg, illeg), w(illeg, del_fin, '-nu-zi')], paragraphSeparator)
    },
    {
      toParse: '8 # [1 NINDA.GUR4.RA KU₇ °LÚ°Š]U.I ú-da-i',
      expected: lineParseSuccess('8', [w(del_in, nc('1')), w(sg('NINDA', '.', 'GUR', indexDigit('4'), '.', 'RA')), w(sg('KU', indexDigit('7'))), w(d('LÚ'), sg('Š', del_fin, 'U', '.', 'I')), w('ú-da-i')])
    },
    {
      toParse: '9 # [na-an _A-NA DUMU].⸢É⸣.GAL pa-a-i', // <lb txtid="KBo 71.53" lnr="Vs. III 9" lg="Hit"/> <w><del_in/>na-an</w> <w><aGr>A-NA</aGr></w> <w><sGr>DUMU<del_fin/>.<laes_in/>É<laes_fin/>.GAL</sGr></w> <w>pa-a-i</w>
      expected: lineParseSuccess('9', [w(del_in, 'na-an'), w(ag('A', '-', 'NA')), w(sg('DUMU', del_in, '.', laes_in, 'É', laes_fin, '.', 'GAL')), w('pa-a-i')])
    },
    {
      toParse: '10 # [DUMU.É.GAL-ma-an _A-N]A GAL DUMU°MEŠ°.É.GAL', // <lb txtid="KBo 71.53" lnr="Vs. III 10" lg="Hit"/> <w><sGr><del_in/>DUMU.É.GAL</sGr>-ma-an</w> <w><aGr>A-N<del_fin/>A</aGr></w> <w><sGr>GAL</sGr></w> <w><sGr>DUMU</sGr><d>MEŠ</d><sGr>.É.GAL</sGr></w> */
      expected: lineParseSuccess('10', [w(sg(del_in, 'DUMU', '.', 'É', '.', 'GAL'), '-ma-an'), w(ag('A', '-', 'N', del_fin, 'A')), w(sg('GAL')), w(sg('DUMU'), d('MEŠ'), sg('.', 'É', '.', 'GAL'))])
    },
    {
      toParse: '11 # [pa-a-i GAL DUMU°MEŠ°].⸢É⸣.GAL-ma-an', // <lb txtid="KBo 71.53" lnr="Vs. III 11" lg="Hit"/> <w><del_in/>pa-a-i</w> <w><sGr>GAL</sGr></w> <w><sGr>DUMU</sGr><d>MEŠ</d><sGr><del_fin/>.<laes_in/>É<laes_fin/>.GAL</sGr>-ma-an</w>
      expected: lineParseSuccess('11', [w(del_in, 'pa-a-i'), w(sg('GAL')), w(sg('DUMU'), d('MEŠ'), sg(del_fin, '.', laes_in, 'É', laes_fin, '.', 'GAL'), '-ma-an')])
    },
    {
      toParse: '12 # [_A-NA °GIŠ°ŠUKUR °D°KA]L pár-ši-ia',
      expected: lineParseSuccess('12', [w(ag(del_in, 'A', '-', 'NA')), w(d('GIŠ'), sg('ŠUKUR')), w(d('D'), sg('KA', del_fin, 'L')), w('pár-ši-ia')])
      // TODO: parsed as lineParseResult('12', [w(ds, ag('A', '-', 'NA')), w(d('GIŠ'), sg('ŠUKUR')), w(d('D'), sg('KA', de, 'L')), w('pár-ši-ia')])
    },
    {
      toParse: '13 # [na-an EGIR-pa _A-N]A DUMU.É.GAL', // <lb txtid="KBo 71.53" lnr="Vs. III 13" lg="Hit"/> <w><del_in/>na-an</w> <w><sGr>EGIR</sGr>-pa</w> <w><aGr>A-N<del_fin/>A</aGr></w> <w><sGr>DUMU.É.GAL</sGr></w>
      expected: lineParseSuccess('13', [w(del_in, 'na-an'), w(sg('EGIR'), '-pa'), w(ag('A', '-', 'N', del_fin, 'A')), w(sg('DUMU', '.', 'É', '.', 'GAL'))])
    },
    {
      toParse: '14 # [pa-a-i DUMU.É.GAL-ma-an E]GIR-pa', // <lb txtid="KBo 71.53" lnr="Vs. III 14" lg="Hit"/> <w><del_in/>pa-a-i</w> <w><sGr>DUMU.É.GAL</sGr>-ma-an</w> <w><sGr>E<del_fin/>GIR</sGr>-pa</w>
      expected: lineParseSuccess('14', [w(del_in, 'pa-a-i'), w(sg('DUMU', '.', 'É', '.', 'GAL'), '-ma-an'), w(sg('E', del_fin, 'GIR'), '-pa')])
    },
    {
      toParse: '15 # [_A-NA °LÚ°ŠU.I pa-a]-⸢i⸣ §', // <lb txtid="KBo 71.53" lnr="Vs. III 15" lg="Hit"/> <w><aGr><del_in/>A-NA</aGr></w> <w><d>LÚ</d><sGr>ŠU.I</sGr></w> <w>pa-a<del_fin/>-<laes_in/>i<laes_fin/></w> </s></p><parsep/><p><s>
      expected: lineParseSuccess('15', [w(ag(del_in, 'A', '-', 'NA')), w(d('LÚ'), sg('ŠU', '.', 'I')), w('pa-a', del_fin, '-', laes_in, 'i', laes_fin)/*, w(paragraphSeparator)*/])
      // TODO: parsed as lineParseResult('15', [w(ds, ag('A', '-', 'NA')), w(d('LÚ'), sg('ŠU', '.', 'I')), w('pa-a', de, '-', ls, 'i', le), w(paragraphSeparator)])
    }/*,
    [
      '{G:Vs. III bricht ab}', // <gap t="line" c="Vs. III bricht ab"/>
      lineParseResult('', [w('<gap t="line" c="Vs. III bricht ab"/>')])
    ]*/
  ])(
    '(doc-$#)should parse "$toParse" as LineParseResult $expected',
    ({toParse, expected}) => expect(parseTransliterationLine(toParse)).toEqual(expected)
  );
});