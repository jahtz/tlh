import {NodeDisplay} from './NodeDisplay';
import {JSX} from 'react';
import {XmlElementNode} from 'simple_xml';
import {DeleteButton, SelectableButton} from '../genericElements/Buttons';
import {useTranslation} from 'react-i18next';
import {FontSizeSelector, FontSizeSelectorProps} from './FontSizeSelector';

export interface NodeEditorRightSideProps {
  originalNode: XmlElementNode;
  changed: boolean;
  applyUpdates: () => void;
  deleteNode?: () => void;
  cancelSelection: () => void;
  jumpElement?: (forward: boolean) => void;
  fontSizeSelectorProps: FontSizeSelectorProps;
}

interface IProps extends NodeEditorRightSideProps {
  children: JSX.Element;
}

export function NodeEditorRightSide({
  originalNode,
  children,
  changed,
  applyUpdates,
  deleteNode,
  jumpElement,
  fontSizeSelectorProps,
  cancelSelection
}: IProps): JSX.Element {

  // TODO: import editing question here for all elements?

  const {t} = useTranslation('common');

  return (
    <div>
      <div className="p-4 rounded-t border border-slate-300 shadow-md">
        <NodeDisplay node={originalNode} isLeftSide={false}/>

        <div className="float-right">
          <FontSizeSelector {...fontSizeSelectorProps}/>

          {jumpElement &&
            <button type="button" className="ml-2 px-2 rounded border border-slate-500" onClick={() => jumpElement(false)}
                    title={t('previousTag') || 'previousTag'}>
              &larr;
            </button>}

          {deleteNode && <DeleteButton onClick={deleteNode} otherClasses={['ml-2', 'px-2', 'rounded']}/>}

          <SelectableButton selected={changed} onClick={applyUpdates} otherClasses={['ml-2', 'px-2', 'rounded']}>
            <>{t('update')}</>
          </SelectableButton>

          <button type="button" className="ml-2 px-2 rounded border border-slate-500" onClick={cancelSelection}
                  title={t('cancelSelection') || 'cancelSelection'}>
            &#x2715;
          </button>

          {jumpElement &&
            <button type="button" className="ml-2 px-2 rounded border border-slate-500" onClick={() => jumpElement(true)} title={t('nextTag') || 'nextTag'}>
              &rarr;
            </button>}
        </div>
      </div>

      <div className="p-2 border border slate-300" style={{fontSize: `${fontSizeSelectorProps.currentFontSize}%`}}>
        {children}
      </div>
    </div>
  );
}