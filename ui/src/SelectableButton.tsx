import classNames, {Argument as ClassNameArgument} from 'classnames';

interface IProps {
  selected: boolean;
  className: ClassNameArgument[];
  onClick: () => void;
  children: string | JSX.Element;
}

export function SelectableButton({selected, className, children, onClick}: IProps): JSX.Element {
  return (
    <button type="button" className={classNames(className, selected ? ['bg-blue-500', 'text-white'] : ['border', 'border-slate-500'])} onClick={onClick}>
      {children}
    </button>
  );
}