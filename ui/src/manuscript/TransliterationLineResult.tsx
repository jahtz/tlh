import {LineNumberInput} from '../graphql';

function isDefined<T>(t: T | undefined | null): t is T {
  return t !== undefined && t !== null;
}

interface ITransliterationLine {
  input: string;
  inputIndex: number;
  lineNumber?: LineNumberInput | undefined | null;
  result?: string | undefined | null;
}

// Single line

interface TransliterationLineDisplayIProps {
  lineNumber: LineNumberInput;
  result: string;
}

function TransliterationLineDisplay({lineNumber, result}: TransliterationLineDisplayIProps): JSX.Element {

  const {number, isConfirmed} = lineNumber;

  return (
    <>
      <sup>{number} {isConfirmed ? '\'' : ''}</sup>
      &nbsp;
      {/*words.map((word, index) => <span key={index}><NodeDisplay node={word} isLeftSide={false}/>&nbsp;</span>)*/}

      {/*maybeParagraphSeparator && <NodeDisplay node={maybeParagraphSeparator} isLeftSide={false}/>*/}
    </>
  );
}

// All lines

interface IProps {
  lines: ITransliterationLine[];
}

export function Transliteration({lines}: IProps): JSX.Element {
  return (
    <div className="p-2 rounded border border-slate-300 shadow shadow-slate-200">
      {lines.map(({input, lineNumber, result}, lineIndex) =>
        isDefined(result) && isDefined(lineNumber)
          ? (
            <p key={lineIndex} className="hittite">
              <TransliterationLineDisplay lineNumber={lineNumber} result={result}/>
            </p>
          )
          : <p key={lineIndex} className="text-red-600">{input.length > 100 ? `${input.substring(0, 100)}...` : input}</p>)}
    </div>
  );
}