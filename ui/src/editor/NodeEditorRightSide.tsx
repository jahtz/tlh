import {NodeDisplay} from './NodeDisplay';
import {XmlElementNode} from './xmlModel/xmlModel';
import {ActivatableButton, DeleteButton} from '../bulmaHelpers/Buttons';
import {useTranslation} from 'react-i18next';

interface IProps {
  originalNode: XmlElementNode;
  children: JSX.Element;
  changed: boolean;
  initiateSubmit: () => void;
  deleteNode?: () => void;
  otherButtons?: JSX.Element;
  jumpElement?: (forward: boolean) => void;
}

export function NodeEditorRightSide({originalNode, children, changed, initiateSubmit, deleteNode, otherButtons, jumpElement}: IProps): JSX.Element {

  // FIXME: import editing question here for all elements?

  const {t} = useTranslation('common');

  return (
    <div>
      <div className="p-4 rounded-t border border-slate-300 shadow-md">
        <NodeDisplay node={originalNode} isLeftSide={false}/>

        <div className="float-right">

          {otherButtons}

          {jumpElement && <button type="button" className="ml-2 px-2 rounded border border-slate-500" onClick={() => jumpElement(false)}
                                  title={t('previousTag')}>&larr;</button>}

          {deleteNode && <DeleteButton onClick={deleteNode} otherClasses={['ml-2', 'px-2', 'rounded']}/>}

          <ActivatableButton text={t('update')} isActive={changed} onClick={initiateSubmit} otherClasses={['ml-2', 'px-2', 'rounded']}/>

          {jumpElement && <button type="button" className="ml-2 px-2 rounded border border-slate-500" onClick={() => jumpElement(true)}
                                  title={t('nextTag')}>&rarr;</button>}

        </div>
      </div>
      <div className="p-2 border border slate-300">
        {children}
      </div>
    </div>
  );
}