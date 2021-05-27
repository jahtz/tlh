import classNames from "classnames";
import {MorphologicalAnalysis} from "../model/morphologicalAnalysis";
import React from "react";

interface MorphAnalysisButtonIProps {
  x: string;
  analysis: string;
  selectedOption: string | undefined;
  select: (s: string) => void;
}

function MorphAnalysisButton({x, analysis, selectedOption, select}: MorphAnalysisButtonIProps): JSX.Element {
  const classes = classNames('button', 'is-fullwidth', 'has-text-left', {'is-link': selectedOption && selectedOption === x});

  return <button onClick={() => select(x)} className={classes}>{x} - {analysis}</button>;
}

interface MorphAnalysisOptionIProps {
  ma: MorphologicalAnalysis;
  selectedOption: string | undefined;
  updateSelected: (s: string) => void;
}

export function MorphAnalysisOption({ma, selectedOption, updateSelected}: MorphAnalysisOptionIProps): JSX.Element {

  const {number, translation, transcription, analyses} = ma;

  return (
    <div className="my-3">
      <h2 className="subtitle is-5">{number}) {translation} ({transcription})</h2>

      <div className="columns is-multiline">
        {typeof analyses === 'string'
          ? <div className="column is-fullwidth">
            <MorphAnalysisButton x={number.toString()} analysis={analyses} select={updateSelected} selectedOption={selectedOption}/>
          </div>
          : analyses.map(({letter, analysis}, index) =>
            <div key={index} className="column is-half-desktop">
              <MorphAnalysisButton x={`${number}${letter}`} analysis={analysis} select={updateSelected} selectedOption={selectedOption}/>
            </div>)}
      </div>
    </div>
  );
}
