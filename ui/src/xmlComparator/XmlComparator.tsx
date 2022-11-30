import {leftColorClass, ReadFile, rightColorClass} from './XmlComparatorContainer';
import {defaultXmlComparatorConfig, makeReplacements, XmlComparatorConfig} from './xmlComparatorConfig';
import {diffLines} from 'diff';

interface IProps {
  leftFile: ReadFile;
  rightFile: ReadFile;
  config?: XmlComparatorConfig;
}

type DiffLine = {
  line: string;
  className: string | undefined;
}

export function XmlComparator({leftFile, rightFile, config = defaultXmlComparatorConfig}: IProps): JSX.Element {

  const firstFileContent = makeReplacements(leftFile.baseContent, config);
  const secondFileContent = makeReplacements(rightFile.baseContent, config);

  const changes2 = diffLines(firstFileContent, secondFileContent).flatMap<DiffLine>(({value, added, removed}) => {
    const className = added ? leftColorClass : (removed ? rightColorClass : undefined);

    return value
      .split('\n')
      .map((line) => ({line, className}));
  });

  return (
    <div>
      {changes2.map(({line, className}, index) =>
        <p key={config.name + '_' + index + '_' + index} style={{wordBreak: 'break-all'}} className={className}>
          {line.replace(/ /g, '\u00a0')}
        </p>
      )}
    </div>
  );
}