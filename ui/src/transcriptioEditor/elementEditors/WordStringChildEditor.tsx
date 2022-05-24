import {useState} from 'react';
import {DeleteButton, EditButton} from '../../bulmaHelpers/Buttons';
import classNames from 'classnames';
import {WordStringChildEditForm} from './WordStringChildEditForm';

interface IProps {
  value: string | undefined;
  set: (newValue: string) => void;
  remove: () => void;
  setKeyHandlingEnabled: (value: boolean) => void;
  isEditingQuestion: boolean;
  strings: {
    add: string;
    placeHolder: string;
  };
}

/**
 * Used for editing questions (attribute q) and footnotes (last child if tag name note)
 */
export function WordStringChildEditor({value, set, remove, setKeyHandlingEnabled, isEditingQuestion, strings}: IProps): JSX.Element {

  const [isEditMode, setIsEditMode] = useState(false);

  function enableEditMode(): void {
    setKeyHandlingEnabled(false);
    setIsEditMode(true);
  }

  function cancelEditMode(): void {
    setKeyHandlingEnabled(true);
    setIsEditMode(false);
  }

  function submitEdit(value: string): void {
    set(value);
    cancelEditMode();
  }

  if (!value && !isEditMode) {
    return (
      <button type="button" className={classNames('p-2', 'rounded', isEditingQuestion ? 'bg-teal-400' : 'bg-slate-400', 'text-white', 'w-full')}
              onClick={enableEditMode}>
        {strings.add}
      </button>
    );
  } else {
    return (
      <div className={classNames('rounded', 'border-l-4', isEditingQuestion ? 'border-teal-400' : 'border-slate-400')}>
        <div className={classNames('p-2', 'rounded-tr', isEditingQuestion ? 'bg-teal-300' : 'bg-slate-300')}>
          <span>{strings.placeHolder}</span>

          <div className="float-right">
            {!isEditMode && <EditButton onClick={enableEditMode}/>}
            <DeleteButton onClick={isEditMode ? cancelEditMode : remove} otherClasses={['ml-2', 'px-2', 'rounded']}/>
          </div>
        </div>
        <div className="p-2 rounded-br border-b border-r">
          {isEditMode
            ? <WordStringChildEditForm initialValue={value} cancel={cancelEditMode} onSubmit={submitEdit} strings={strings}/>
            : value}
        </div>
      </div>
    );
  }
}