import React, {useState} from 'react';
import {FileLoader} from '../forms/FileLoader';
import {loadXml} from './xmlLoader';
import {AOXml, aoXmlFormat} from './document';
import {AOTextContent} from './documentBody';
import {isAOParagraph, Paragraph} from '../model/paragraph';
import {AOWord, isAOWord} from '../model/sentenceContent/word';
import {WordEditor} from './WordEditor';
import {isParagraphSeparator} from '../model/paragraphSeparators';
import {AOSentenceContent} from '../model/sentence';
import {WordComponent} from '../manuscript/TransliterationLineResult';
import {isAOLineBreak} from '../model/sentenceContent/linebreak';
import {useTranslation} from 'react-i18next';
import {isSuccess} from '../functional/result';

interface AOSentenceContentRenderIProps {
  sc: AOSentenceContent;
  paragraphIndex: number;
  wordIndex: number;
  onWordClick: (w: EditedWord) => void;
  currentEditedWord: EditedWord | undefined;
}

function AoSentenceContentRender(
  {sc, paragraphIndex, wordIndex, onWordClick, currentEditedWord}: AOSentenceContentRenderIProps
): JSX.Element {
  if (isAOWord(sc)) {
    const otherStyles = {
      'is-underlined': !sc.mrp0sel,
      'has-background-primary': currentEditedWord && currentEditedWord.paragraphIndex === paragraphIndex && currentEditedWord.wordIndex === wordIndex
    };

    return <>
      <WordComponent word={sc} onClick={() => onWordClick({word: sc, paragraphIndex, wordIndex})}
                     otherStyles={otherStyles}/>
      &nbsp;&nbsp;
    </>;
  } else if (isAOLineBreak(sc)) {
    return <br/>;
  } else {
    return <span className="has-text-danger">{JSON.stringify(sc)}</span>;
  }
}

interface TextContentRenderIProps {
  paragraphIndex: number;
  content: AOTextContent;
  onWordClick: (w: EditedWord) => void;
  currentEditedWord: EditedWord | undefined;
}

function TextContentRender(
  {paragraphIndex, content, onWordClick, currentEditedWord}: TextContentRenderIProps
): JSX.Element {
  if (isAOParagraph(content)) {
    return <>
      {content.s.content.map((c, index) =>
        <AoSentenceContentRender key={index} sc={c} paragraphIndex={paragraphIndex} wordIndex={index}
                                 onWordClick={onWordClick} currentEditedWord={currentEditedWord}/>
      )}
    </>;
  } else if (isParagraphSeparator(content)) {
    return <p>¬¬¬</p>;
  } else /* if (isParagraphSeparatorDouble(content)) */ {
    return <p>===</p>;
  }
}

export interface EditedWord {
  word: AOWord;
  paragraphIndex: number;
  wordIndex: number;
}

interface DocumentEditorIProps {
  aoXml: AOXml;
  filename: string;
}

interface DocumentEditorIState {
  aoXml: AOXml;
  editedWord?: EditedWord;
}

function handleSaveToPC(data: string, filename: string): void {
  const blob = new Blob([data], {type: 'text/plain'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.download = filename;
  link.href = url;
  link.click();
}

function selectPreviousWord(aoXml: AOXml, currentParagraphIndex: number, currentWordIndex: number): EditedWord | undefined {
  const textContents = aoXml.body.div1.text.content;

  for (let paragraphIndex = currentParagraphIndex; paragraphIndex >= 0; paragraphIndex--) {
    const textContent = textContents[paragraphIndex];

    if (isAOParagraph(textContent)) {
      const contents = textContent.s.content;

      const lastWordIndex = paragraphIndex === currentParagraphIndex ? currentWordIndex : contents.length;

      for (let wordIndex = lastWordIndex - 1; wordIndex >= 0; wordIndex--) {
        const content = contents[wordIndex];

        if (isAOWord(content)) {
          return {paragraphIndex, wordIndex, word: content};
        }
      }
    }

  }

  return undefined;
}

function selectNextWord(aoXml: AOXml, currentParagraphIndex: number, currentWordIndex: number): EditedWord | undefined {
  const textContents = aoXml.body.div1.text.content;

  for (let paragraphIndex = currentParagraphIndex; paragraphIndex < textContents.length; paragraphIndex++) {
    const textContent = textContents[paragraphIndex];

    if (isAOParagraph(textContent)) {
      const contents = textContent.s.content;

      const firstWordIndex = paragraphIndex === currentParagraphIndex ? currentWordIndex : 0;

      for (let wordIndex = firstWordIndex + 1; wordIndex < contents.length; wordIndex++) {
        const content = contents[wordIndex];

        if (isAOWord(content)) {
          return {paragraphIndex, wordIndex, word: content};
        }
      }
    }
  }

  return undefined;
}

function DocumentEditor({aoXml: initialAoXml, filename}: DocumentEditorIProps): JSX.Element {

  const {t} = useTranslation('common');
  const [state, setState] = useState<DocumentEditorIState>({aoXml: initialAoXml});

  function updateMorphology(morph: string | string[], paragraphId: number, wordId: number): void {


    setState(({aoXml, editedWord}) => {
      const paragraph = (aoXml.body.div1.text.content[paragraphId] as Paragraph);
      const word = paragraph.s.content[wordId] as AOWord;
      word.mrp0sel = typeof morph === 'string' ? morph : morph.join(',');

      return {aoXml, editedWord};
    });
  }

  function previousWord(): void {
    if (state.editedWord) {
      const editedWord = selectPreviousWord(state.aoXml, state.editedWord.paragraphIndex, state.editedWord.wordIndex);

      if (editedWord) {
        setState(({aoXml}) => {
          return {aoXml, editedWord};
        });
      }
    }
  }

  function nextWord(): void {
    if (state.editedWord) {
      const editedWord = selectNextWord(state.aoXml, state.editedWord.paragraphIndex, state.editedWord.wordIndex);

      if (editedWord) {
        setState(({aoXml}) => {
          return {aoXml, editedWord};
        });
      }
    }
  }

  function setEditedWord(editedWord: EditedWord): void {
    setState(({aoXml, editedWord: oldEditedWord}) => {
      if (oldEditedWord && editedWord.paragraphIndex === oldEditedWord.paragraphIndex && editedWord.wordIndex === oldEditedWord.wordIndex) {
        return {aoXml, editedWord: undefined};
      } else {
        return {aoXml, editedWord};
      }
    });
  }

  function exportDocument(): void {
    handleSaveToPC(aoXmlFormat.write(state.aoXml).join('\n'), filename);
  }

  return (
    <div className="columns">
      <div className="column">
        <div className="documentText">
          {state.aoXml.body.div1.text.content.map((c, index) =>
            <TextContentRender key={index} paragraphIndex={index} content={c} onWordClick={setEditedWord} currentEditedWord={state.editedWord}/>)}
        </div>

        <div className="buttons my-3">
          <button className="button is-link is-fullwidth" onClick={exportDocument}>{t('exportDocument')}</button>
        </div>
      </div>
      <div className="column">
        {state.editedWord &&
        <WordEditor key={state.editedWord.word.transliteration} w={state.editedWord} update={updateMorphology} previousWord={previousWord}
                    nextWord={nextWord}/>}
      </div>
    </div>
  );
}

interface DocumentEditorContainerState {
  aoXml: AOXml;
  filename: string;
}

function documentEditorContainerState(aoXml: AOXml, filename: string): DocumentEditorContainerState {
  return {aoXml, filename};
}

export function DocumentEditorContainer(): JSX.Element {

  const [state, setState] = useState<DocumentEditorContainerState | undefined>();

  async function readFile(file: File): Promise<void> {
    const aoXmlResult = await loadXml(file);

    if (isSuccess(aoXmlResult)) {
      setState(() => documentEditorContainerState(aoXmlResult.value, file.name));
    } else {
      aoXmlResult.error.forEach((e) => console.error(JSON.stringify(e)));
    }
  }

  return (
    <div className="container">
      {state
        ? <DocumentEditor aoXml={state.aoXml} filename={state.filename}/>
        : <FileLoader accept="text/xml" onLoad={readFile}/>}
    </div>
  );
}