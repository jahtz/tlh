import React from 'react';
import {isDeterminativ} from '../model/wordContent/determinativ';
import {TransliterationLine} from '../model/transliterationLine';
import {isAoSign} from '../model/wordContent/sign';
import {getSymbolForDamageType, isDamageContent} from '../model/wordContent/damages';
import {isCorrectionContent} from '../model/wordContent/corrections';
import {isAkkadogramm} from '../model/wordContent/akkadogramm';
import {isSumerogramm} from '../model/wordContent/sumerogramm';
import {AOWord} from '../model/sentenceContent/word';
import {isMaterLectionis} from '../model/wordContent/materLectionis';
import {isNumeralContent} from '../model/wordContent/numeralContent';
import {isAoFootNote} from '../model/wordContent/footNote';
import {isAoKolonMark} from '../model/wordContent/kolonMark';
import {AOSimpleWordContent, AOWordContent} from '../model/wordContent/wordContent';
import {isIllegibleContent} from '../model/wordContent/illegible';
import {isSpace} from '../model/wordContent/space';
import {isEllipsis} from '../model/wordContent/ellipsis';
import {isBasicText} from '../model/wordContent/basicText';

function renderSimpleWordContent(content: AOSimpleWordContent): JSX.Element {
  if (isMaterLectionis(content)) {
    return <span className="materLectionis">{content.content}</span>;
  } else if (isAoFootNote(content)) {
    return <span className="has-text-warning">TODO: {content.content}!</span>;
  } else if (isAoSign(content)) {
    return <span className="has-text-warning">TODO: {content.content}!</span>;
  } else if (isAoKolonMark(content)) {
    return <span className="has-text-warning">TODO: {content.content}!</span>;
  } else if (isSpace(content)) {
    return <span>TODO: how to render AOSpace?</span>;
  } else if (isEllipsis(content)) {
    return <span>…</span>;
  } else if (isDamageContent(content)) {
    return <span>{getSymbolForDamageType(content.damageType)}</span>;
  } else if (isCorrectionContent(content)) {
    return <sup className="correction">{content.c}</sup>;
  } else if (isBasicText(content)) {
    return <span>{content.content}</span>;
  } else /* if(isInscribedLetter(c)) */ {
    return <span>{content.content}</span>;
  }
}

export function WordContentDisplay({content}: { content: AOWordContent }): JSX.Element {
  if (isAkkadogramm(content)) {
    return <span className="akkadogramm">
      {content.contents.map((c, index) => <WordContentDisplay content={c} key={index}/>)}
    </span>;
  } else if (isSumerogramm(content)) {
    return <span className="sumerogramm">
      {content.contents.map((c, index) => <WordContentDisplay content={c} key={index}/>)}
    </span>;
  } else if (isDeterminativ(content)) {
    return <span className="determinativ">
      {content.content.map((c, index) => <WordContentDisplay content={c} key={index}/>)}
    </span>;
  } else if (isNumeralContent(content)) {
    return <span className="numberal">
      {content.content.map((c, index) => <WordContentDisplay content={c} key={index}/>)}
    </span>;
  } else if (isIllegibleContent(content)) {
    return <span>x</span>;
  } else {
    return renderSimpleWordContent(content);
  }
}

// Single word

interface WordComponentIProps {
  word: AOWord;
  onClick?: () => void;
}

export function WordComponent({word: {transliteration, content}, onClick}: WordComponentIProps): JSX.Element {
  return <span onClick={onClick}>
    {content.length > 0
      ? content.map((c, i) => <WordContentDisplay content={c} key={i}/>)
      : <span className="has-text-danger">{transliteration}</span>}
  </span>;
}

// Single line

export function renderLine({lineInput, result}: TransliterationLine): JSX.Element {
  if (result) {
    const {lineNumber, words} = result;

    return <>
      <sup>{lineNumber}</sup>
      &nbsp;
      {words.map((wordInput, index) => <span key={index}><WordComponent word={wordInput}/>&nbsp;</span>)}
    </>;
  } else {
    return (
      <span className="has-text-danger">
        {lineInput.length > 100 ? `${lineInput.substr(0, 100)}...` : lineInput}
      </span>
    );
  }
}

// All lines

interface IProps {
  lines: TransliterationLine[];
}

export function Transliteration({lines}: IProps): JSX.Element {
  return (
    <div className="box">
      {lines.map((lineParseResult, lineIndex) =>
        <p key={lineIndex} className="hittite">{renderLine(lineParseResult)}</p>
      )}
    </div>
  );
}