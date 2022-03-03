import {EditingQuestionForm} from './EditingQuestionForm';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {DeleteButton, EditButton} from '../../bulmaHelpers/Buttons';

interface IProps {
  editingQuestion: string | undefined;
  removeEditingQuestion: () => void;
  setEditingQuestion: (value: string) => void;
  setKeyHandlingEnabled: (value: boolean) => void;
}

export function EditingQuestionSection({editingQuestion, removeEditingQuestion, setEditingQuestion, setKeyHandlingEnabled}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [addEditingQuestionEnabled, setAddEditingQuestionEnabled] = useState(false);

  function addEditingQuestion(value: string): void {
    setEditingQuestion(value);
    cancelAddEditingQuestion();
  }

  function cancelAddEditingQuestion(): void {
    setKeyHandlingEnabled(true);
    setAddEditingQuestionEnabled(false);
  }

  function enableAddEditingQuestion(): void {
    setKeyHandlingEnabled(false);
    setAddEditingQuestionEnabled(true);
  }

  if (!addEditingQuestionEnabled && !editingQuestion) {
    return <button type="button" className="p-2 rounded bg-cyan-500 text-white w-full" onClick={enableAddEditingQuestion}>{t('addEditingQuestion')}</button>;
  } else {
    return (
      <div className="rounded border-l-4 border-teal-500">
        <div className="p-2 rounded-tr bg-teal-300">
          {t('note')}
         
          <div className="float-right">
            {!addEditingQuestionEnabled && <EditButton onClick={enableAddEditingQuestion}/>}
            <DeleteButton onClick={addEditingQuestionEnabled ? cancelAddEditingQuestion : removeEditingQuestion} otherClasses={['ml-2', 'px-2', 'rounded']}/>
          </div>
        </div>
        <div className="p-2 rounded-br border-b border-r">

          {addEditingQuestionEnabled
            ? <EditingQuestionForm initialValue={editingQuestion} cancel={cancelAddEditingQuestion} onSubmit={addEditingQuestion}/>
            : editingQuestion}
        </div>
      </div>
    );
  }
}