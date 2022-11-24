import {TransliterationLine} from '../model/transliterationLine';
import {AOLineBreak} from '../model/sentenceContent/linebreak';
import {NodeDisplay} from '../xmlEditor/NodeDisplay';
import {paragraphSeparatorDoubleXmlNode, paragraphSeparatorXmlNode} from '../model/paragraphSeparator';

// Single line

function TransliterationLineDisplay({result: {lb: {lnr}, words, maybeParagraphSeparator}}: { result: AOLineBreak }): JSX.Element {
  return (
    <>
      <sup>{lnr}</sup>
      &nbsp;
      {words.map(({/*transliteration,*/ content}, index) =>
        <span key={index}>{content.map((c, i) => <NodeDisplay node={c} isLeftSide={false} key={i}/>)}&nbsp;</span>
      )}

      {maybeParagraphSeparator &&
        <NodeDisplay node={maybeParagraphSeparator.double ? paragraphSeparatorDoubleXmlNode : paragraphSeparatorXmlNode} isLeftSide={false}/>}
    </>
  );
}

// All lines

interface IProps {
  lines: TransliterationLine[];
}

export function Transliteration({lines}: IProps): JSX.Element {
  return (
    <div className="p-2 rounded border border-slate-300 shadow shadow-slate-200">
      {lines.map(({lineInput, result}, lineIndex) =>
        result
          ? <p key={lineIndex} className="hittite"><TransliterationLineDisplay result={result}/></p>
          : <p key={lineIndex} className="text-red-600">{lineInput.length > 100 ? `${lineInput.substring(0, 100)}...` : lineInput}</p>)}
    </div>
  );
}