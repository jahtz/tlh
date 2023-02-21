import classNames from 'classnames';
import {useTranslation} from 'react-i18next';

interface BaseProps {
  onClick: () => void;
  otherClasses?: string[];
  title?: string;
}

interface SelectableButtonProps extends BaseProps {
  children: JSX.Element;
  selected: boolean;
}

export function SelectableButton({children, title, selected, onClick, otherClasses}: SelectableButtonProps): JSX.Element {
  const className = classNames(otherClasses, selected ? ['bg-blue-500', 'text-white'] : ['border', 'border-slate-500']);

  return (
    <button type="button" className={className} onClick={onClick} title={title}>{children}</button>
  );
}

export function DeleteButton({title, onClick, otherClasses}: BaseProps): JSX.Element {
  return (
    <button type="button" className={classNames('bg-red-500', 'text-white', otherClasses)} onClick={onClick} title={title}>&ndash;</button>
  );
}

export function EditButton({onClick, otherClasses}: BaseProps): JSX.Element {

  const {t} = useTranslation('common');

  const className = classNames('ml-2', 'px-2', 'rounded', 'bg-blue-500', 'text-white', otherClasses);

  return (
    <button type="button" className={className} onClick={onClick} title={t('editContent') || 'editContent'}>
      &#9998;
    </button>
  );
}