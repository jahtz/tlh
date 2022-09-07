import {NodeDisplay} from './NodeDisplay';
import {XmlElementNode} from '../xmlModel/xmlModel';
import {SelectableButton, DeleteButton} from '../genericElements/Buttons';
import {useTranslation} from 'react-i18next';
import {FontSizeSelector, FontSizeSelectorProps} from './FontSizeSelector';

export interface NodeEditorRightSideProps {
  originalNode: XmlElementNode;
  changed: boolean;
  initiateSubmit: () => void;
  deleteNode?: () => void;
  cancelSelection: () => void;
}

interface IProps extends NodeEditorRightSideProps {
  children: JSX.Element;
  otherButtons?: JSX.Element;
  jumpElement?: (forward: boolean) => void;
  fontSizeSelectorProps: FontSizeSelectorProps;
}

export function NodeEditorRightSide({
  originalNode,
  children,
  changed,
  initiateSubmit,
  deleteNode,
  otherButtons,
  jumpElement,
  fontSizeSelectorProps,
  cancelSelection
}: IProps): JSX.Element {

  // FIXME: import editing question here for all elements?

  const {t} = useTranslation('common');

  return (
    <div>
      <div className="p-4 rounded-t border border-slate-300 shadow-md">
        <NodeDisplay node={originalNode} isLeftSide={false}/>

        <div className="float-right">
          <FontSizeSelector {...fontSizeSelectorProps}/>

          {otherButtons}

          {jumpElement && <button type="button" className="ml-2 px-2 rounded border border-slate-500" onClick={() => jumpElement(false)}
                                  title={t('previousTag')}>&larr;</button>}

          {deleteNode && <DeleteButton onClick={deleteNode} otherClasses={['ml-2', 'px-2', 'rounded']}/>}

          <SelectableButton selected={changed} onClick={initiateSubmit} otherClasses={['ml-2', 'px-2', 'rounded']}>
            <>{t('update')}</>
          </SelectableButton>

          <button type="button" className="ml-2 px-2 rounded border border-slate-500" onClick={cancelSelection} title={t('cancelSelection')}>&#x2715;</button>

          {jumpElement && <button type="button" className="ml-2 px-2 rounded border border-slate-500" onClick={() => jumpElement(true)}
                                  title={t('nextTag')}>&rarr;</button>}
        </div>
      </div>

      <div className="p-2 border border slate-300" style={{fontSize: `${fontSizeSelectorProps.currentFontSize}%`}}>
        {children}
      </div>
    </div>
  );
}