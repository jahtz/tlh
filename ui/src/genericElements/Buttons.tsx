import {ReactElement} from 'react';
import classNames from 'classnames';

interface BaseProps {
  onClick: () => void;
  otherClasses?: string[];
  title?: string;
}

interface SelectableButtonProps extends BaseProps {
  children: ReactElement;
  selected: boolean;
}

export const SelectableButton = ({children, title, selected, onClick, otherClasses}: SelectableButtonProps): ReactElement => (
  <button type="button" className={classNames(otherClasses, selected ? ['bg-blue-500', 'text-white'] : ['border', 'border-slate-500'])} onClick={onClick}
          title={title}>
    {children}
  </button>
);

export const DeleteButton = ({title, onClick, otherClasses}: BaseProps): ReactElement => (
  <button type="button" className={classNames('bg-red-500', 'text-white', otherClasses)} onClick={onClick} title={title}>&ndash;</button>
);
