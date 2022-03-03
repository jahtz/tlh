import classNames from 'classnames';
import {useTranslation} from 'react-i18next';

interface BaseProps {
  onClick: () => void;
  otherClasses?: string[];
}

interface ActivatableButtonProps extends BaseProps {
  text: string;
  isActive: boolean;

}

export function ActivatableButton({text, isActive, onClick, otherClasses}: ActivatableButtonProps): JSX.Element {
  return (
    <button type="button" className={classNames(isActive ? ['bg-blue-500', 'text-white'] : ['border', 'border-slate-500'], otherClasses)}
            onClick={onClick} title={text}>
      {text}
    </button>
  );
}

interface DeleteButtonProps extends BaseProps {
  title?: string;
}

export function DeleteButton({title, onClick, otherClasses}: DeleteButtonProps): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <button type="button" className={classNames('bg-red-500', 'text-white', otherClasses)} onClick={onClick} title={title || t('deleteNode')}>
      &ndash;
    </button>
  );
}

/*
interface EditButtonProps {

}
 */

export function EditButton({onClick, otherClasses}: BaseProps): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <button type="button" className={classNames('ml-2', 'px-2', 'rounded', 'bg-blue-500', 'text-white', otherClasses)} onClick={onClick}
            title={t('editContent')}>
      &#9998;
    </button>
  );
}