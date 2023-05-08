import {leftColorClass, ReadFile, rightColorClass} from './XmlComparatorContainer';
import {JSX} from 'react';
import {defaultXmlComparatorConfig, makeReplacements, XmlComparatorConfig} from './xmlComparatorConfig';
import {Change, diffLines} from 'diff';

interface IProps {
  leftFile: ReadFile;
  rightFile: ReadFile;
  config?: XmlComparatorConfig;
}

function DiffDisplay({change, number}: { change: Change, number: number }): JSX.Element {

  const {value, removed, added} = change;

  const className = added ? leftColorClass : (removed ? rightColorClass : undefined);

  return (
    <div id={`change_${number}`}>
      {value.split(/\n/).map((line, index) =>
        <p key={index} style={{wordBreak: 'break-all'}} className={className}>
          {line.replace(/ /g, '\u00a0')}
        </p>
      )}
    </div>
  );
}

export function XmlComparator({leftFile, rightFile, config = defaultXmlComparatorConfig}: IProps): JSX.Element {

  const changes: Change[] = diffLines(
    makeReplacements(leftFile.baseContent, config),
    makeReplacements(rightFile.baseContent, config)
  );

  const links = changes
    .flatMap((change, index) => change.added || change.removed ? [index] : []);

  function navigateToChange(index: number): void {
    window.location.hash = `change_${index}`;
  }

  return (
    <div className="flex">
      <div>
        {links.map((link) => <div key={link} className="my-2">
          <button key={link} type="button" onClick={() => navigateToChange(link)} className="p-2 rounded border border-slate-500">{link}</button>
        </div>)}
      </div>
      <div className="flex-grow overflow-scroll max-h-screen">
        {changes.map((change, index) => <DiffDisplay key={index} change={change} number={index}/>)}
      </div>
    </div>
  );
}