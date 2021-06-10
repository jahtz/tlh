import React, {useState} from 'react';
import {FileLoader} from '../forms/FileLoader';
import {loadNewXml} from './xmlLoader';
import {AOWord} from '../model/sentenceContent/word';
import {XmlNode} from './xmlModel';
import {NewDocumentEditor} from './NewDocumentEditor';


export interface EditedWord {
  word: AOWord;
  paragraphIndex: number;
  wordIndex: number;
}

export function handleSaveToPC(data: string, filename: string): void {
  const blob = new Blob([data], {type: 'text/plain'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.download = filename;
  link.href = url;
  link.click();
}

/*
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

 */


export function DocumentEditorContainer(): JSX.Element {

  const [newXml, setNewXml] = useState<XmlNode | undefined>();

  async function readFile(file: File): Promise<void> {
    const newXmlResult = await loadNewXml(file);
    setNewXml(newXmlResult);
  }

  return (
    <div className="container">
      {newXml
        ? <NewDocumentEditor node={newXml}/>
        : <FileLoader accept="text/xml" onLoad={readFile}/>}
    </div>
  );
}