import {joinStrings} from './foreignWordsParser';

describe('joinStrings', () => {
  it('should join string', () => {
    expect(joinStrings(['A+NA'])).toEqual(['A+NA']);
    expect(joinStrings(['A', '+', 'NA'])).toEqual(['A+NA']);
  });
});
