import {reconstructTransliteration} from './transliterationReconstruction';
import {XmlNode} from '../xmlModel/xmlModel';

const attributes = {};
const children: XmlNode[] = [];

const sumGrm = {tagName: 'sGr', attributes, children: [{textContent: 'GAL'}]};
const akGrm = {tagName: 'aGr', attributes, children: [{textContent: 'GAL'}]};

const laes_in = {tagName: 'laes_in', attributes, children};
const laes_fin = {tagName: 'laes_fin', attributes, children};

const ras_in = {tagName: 'ras_in', attributes, children};
const ras_fin = {tagName: 'ras_fin', attributes, children};

const corrEx = {tagName: 'corr', attributes: {c: '!'}, children};
const corrQm = {tagName: 'corr', attributes: {c: '?'}, children};

const fn = {tagName: 'note', attributes: {n: 3, c: 'Text: ME.'}, children};

describe('textReconstruction', () => {

  test.each<[XmlNode, boolean, string]>([
    // "Normal" text
    [{textContent: 'text'}, false, 'text'],

    // Sumerogramme
    [sumGrm, false, '-GAL'],
    [sumGrm, true, 'GAL'],

    // Akadogramme
    [akGrm, false, '--GAL'],
    [akGrm, true, '_GAL'],

    // Deletions
    [laes_in, false, '⸢'],
    [laes_in, true, '⸢'],

    [laes_fin, false, '⸣'],
    [laes_fin, true, '⸣'],

    [ras_in, true, '*'],
    [ras_in, false, '*'],

    [ras_fin, true, '*'],
    [ras_fin, false, '*'],

    // Corrections
    [corrEx, false, '!'],
    [corrEx, true, '!'],

    [corrQm, false, '?'],
    [corrQm, true, '?'],

    // Footnotes
    [fn, false, '{F: Text: ME.}'],
    [fn, true, '{F: Text: ME.}']
  ])(
    'should reconstruct %j (as first: %s) as %o',
    (toReconstruct, isFirstChild, reconstructed) => {
      expect(reconstructTransliteration(toReconstruct, isFirstChild)).toEqual(reconstructed);
    }
  );

});