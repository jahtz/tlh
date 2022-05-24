import {useTranslation} from 'react-i18next';
import classNames from 'classnames';

export interface UpdatePrevNextButtonsProps {
  changed: boolean;
  initiateUpdate: () => void;
  initiateJumpElement: (forward: boolean) => void;
  deleteElement?: () => void;
}

export function UpdatePrevNextButtons({changed, initiateUpdate, deleteElement, initiateJumpElement}: UpdatePrevNextButtonsProps): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <div className={classNames('grid', deleteElement ? 'grid-cols-4' : 'grid-cols-3')}>
      <button type="button" className="p-2 rounded-l border-l border-y border-slate-500 font-bold text-center" onClick={() => initiateJumpElement(false)}
              tabIndex={-1}>
        &larr;
      </button>

      {deleteElement &&
        <button type="button" className="p-2 bg-red-600 text-white font-bold text-xl text-center" title={t('deleteNode')} onClick={deleteElement}>
          &minus;
        </button>}

      <button type="button" className={classNames('p-2', 'text-center', changed ? ['bg-blue-600', 'text-white'] : ['border', 'border-slate-500'])}
              onClick={initiateUpdate} tabIndex={-1}>
        {t('update')}
      </button>

      <button type="button" className="p-2 rounded-r border-r border-y border-slate-500 font-bold text-center" onClick={() => initiateJumpElement(true)}
              tabIndex={-1}>
        &rarr;
      </button>
    </div>
  );
}