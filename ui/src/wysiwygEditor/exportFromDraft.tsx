import {convertToRaw, EditorState, RawDraftContentBlock, RawDraftInlineStyleRange} from 'draft-js';
import {InlineStyle} from './wysiwygStyle';

function compareInlineStyleRange({offset: offset1}: RawDraftInlineStyleRange, {offset: offset2}: RawDraftInlineStyleRange): number {
  return offset1 - offset2;
}

interface StyledText {
  text: string;
  style: InlineStyle;
}

type TextPart = string | StyledText;

function analyzeBlock({text, inlineStyleRanges}: RawDraftContentBlock): TextPart[] {
  const subTexts: TextPart[] = [];

  let takenAway = 0;

  for (const {offset, length, style} of inlineStyleRanges.sort(compareInlineStyleRange)) {
    if (takenAway < offset) {
      // Take not styled text in between...
      subTexts.push(text.substring(takenAway, offset));
    }

    subTexts.push({text: text.substring(offset, offset + length), style: style as InlineStyle});

    takenAway = offset + length;
  }

  subTexts.push(text.slice(takenAway));

  return subTexts;
}

function exportStyledText({text, style}: StyledText): string {
  if (style === 'Akadogramm') {
    return `<aGr>${text}</aGr>`;
  } else {
    return `<sGr>${text}</sGr>`;
  }
}

function exportBlockAnalysis(parts: TextPart[]): string {
  return parts.map((part) =>
    typeof part === 'string'
      ? part
      : exportStyledText(part)
  )
    .join('');
}

export function exportFromDraft(editorState: EditorState): string[] {
  return convertToRaw(editorState.getCurrentContent()).blocks.map((block) => {
    const analysis = analyzeBlock(block);

    return exportBlockAnalysis(analysis);
  });
}