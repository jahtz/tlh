import {AOGap} from './sentenceContent/gap';
import {AOLineBreak} from './sentenceContent/linebreak';
import {AOWord} from './sentenceContent/word';

export interface AOSentence {
  type: 'AOSentence';
  content: AOSentenceContent[];
}

export type AOSentenceContent = AOGap | AOLineBreak | AOWord;
