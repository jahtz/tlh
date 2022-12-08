import {leftColorClass, ReadFile, rightColorClass} from './XmlComparatorContainer';
import {defaultXmlComparatorConfig, makeReplacements, XmlComparatorConfig} from './xmlComparatorConfig';
import {Change, diffLines} from 'diff';

interface IProps {
  leftFile: ReadFile;
  rightFile: ReadFile;
  config?: XmlComparatorConfig;
}

function DiffDisplay({change}: { change: Change }): JSX.Element {

  const {value, removed, added} = change;

  const className = added ? leftColorClass : (removed ? rightColorClass : undefined);

  return (
    <>
      {value.split(/\n/).map((line, index) =>
        <p key={index} style={{wordBreak: 'break-all'}} className={className}>
          {line.replace(/ /g, '\u00a0')}
        </p>
      )}
    </>
  );
}

export function XmlComparator({leftFile, rightFile, config = defaultXmlComparatorConfig}: IProps): JSX.Element {

  const diff = diffLines(
    makeReplacements(leftFile.baseContent, config),
    makeReplacements(rightFile.baseContent, config)
  );

  return (
    <>
      {diff.map((change, index) => <DiffDisplay key={index} change={change}/>)}
    </>
  );
}