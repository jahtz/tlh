import React, {useState} from "react";
import {FileLoader} from '../forms/FileLoader';
import {loadXml} from './xmlLoader';
import {AOXml, aoXmlFormat} from "./document";
import {AOTextContent} from "./documentBody";
import {isAOParagraph, Paragraph} from "../model/paragraph";
import {AOWord, isAOWord} from "../model/sentenceContent/word";
import {WordEditor} from './WordEditor';
import {isParagraphSeparator} from "../model/paragraphSeparators";
import {AOSentenceContent} from "../model/sentence";
import {WordComponent} from "../manuscript/TransliterationLineResult";
import {isAOLineBreak} from "../model/sentenceContent/linebreak";
import {useTranslation} from "react-i18next";

interface AOSentenceContentRenderIProps {
  sc: AOSentenceContent;
  paragraphIndex: number;
  wordIndex: number;
  onWordClick: (w: EditedWord) => void;
  currentEditedWord: EditedWord | undefined;
}

function AoSentenceContentRender({sc, paragraphIndex, wordIndex, onWordClick, currentEditedWord}: AOSentenceContentRenderIProps): JSX.Element {
  if (isAOWord(sc)) {
    const otherStyles = {
      'is-underlined': !sc.mrp0sel,
      'has-background-primary': currentEditedWord && currentEditedWord.paragraphIndex === paragraphIndex && currentEditedWord.wordIndex === wordIndex
    };

    return <>
      <WordComponent word={sc} onClick={() => onWordClick({word: sc, paragraphIndex, wordIndex})} otherStyles={otherStyles}/>
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

function TextContentRender({paragraphIndex, content, onWordClick, currentEditedWord}: TextContentRenderIProps): JSX.Element {
  if (isAOParagraph(content)) {
    return <>
      {content.s.content.map((c, index) =>
        <AoSentenceContentRender key={index} sc={c} paragraphIndex={paragraphIndex} wordIndex={index} onWordClick={onWordClick}
                                 currentEditedWord={currentEditedWord}/>
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
}

interface DocumentEditorIState {
  aoXml: AOXml;
  editedWord?: EditedWord;
}

function handleSaveToPC(data: string, filename: string = 'exported.xml'): void {
  const blob = new Blob([data], {type: "text/plain"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.download = filename;
  link.href = url;
  link.click();
}


function DocumentEditor({aoXml: initialAoXml}: DocumentEditorIProps): JSX.Element {

  const {t} = useTranslation('common');
  const [state, setState] = useState<DocumentEditorIState>({aoXml: initialAoXml});

  function updateMorphology(morph: string, paragraphId: number, wordId: number): void {
    setState(({aoXml, editedWord: _}) => {
      const paragraph = (aoXml.body.div1.text.content[paragraphId] as Paragraph);
      const word = paragraph.s.content[wordId] as AOWord;
      word.mrp0sel = morph;

      return {aoXml, editedWord: undefined};
    });
  }

  function setEditedWord(editedWord: EditedWord): void {
    setState(({aoXml, editedWord: oldEditedWord}) => {
      if (oldEditedWord && editedWord.paragraphIndex === oldEditedWord.paragraphIndex && editedWord.wordIndex === oldEditedWord.wordIndex) {
        return {aoXml, editedWord: undefined};
      } else {
        return {aoXml, editedWord};
      }
    })
  }

  function exportDocument(): void {
    handleSaveToPC(aoXmlFormat.write(state.aoXml).join('\n'));
  }

  return (
    <div className="columns">
      <div className="column">
        <div className="documentText">
          {state.aoXml.body.div1.text.content.map((c, index) =>
            <TextContentRender key={index} paragraphIndex={index} content={c} onWordClick={setEditedWord} currentEditedWord={state.editedWord}/>)}
        </div>

        <div className="buttons my-3">
          <button className="button is-link is-fullwidth" onClick={exportDocument} disabled={!!state.editedWord}>{t('exportDocument')}</button>
        </div>
      </div>
      <div className="column">
        {state.editedWord && <WordEditor key={state.editedWord.word.transliteration} w={state.editedWord} update={updateMorphology}/>}
      </div>
    </div>
  );
}

export function DocumentEditorContainer(): JSX.Element {

  const [state, setState] = useState<AOXml | undefined>();

  async function readFile(file: File): Promise<void> {
    const aoXml = await loadXml(file);
    setState(() => aoXml);
  }

  return (
    <div className="container">
      {state
        ? <DocumentEditor aoXml={state}/>
        : <FileLoader accept="text/xml" onLoad={readFile}/>}
    </div>
  );
}