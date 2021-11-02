import React from 'react';
import {IoArrowBack, IoArrowForward} from 'react-icons/io5';
import {useTranslation} from 'react-i18next';

export interface UpdatePrevNextButtonsProps {
  initiateUpdate: () => void;
  initiateJumpElement: (forward: boolean) => void;
}

export function UpdatePrevNextButtons({initiateUpdate, initiateJumpElement}: UpdatePrevNextButtonsProps): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <>
      <div className="mb-1">
        <button type="button" className="button is-link is-fullwidth" onClick={initiateUpdate} tabIndex={-1}>{t('update')}</button>
      </div>

      <div className="field has-addons">
        <div className="control is-expanded">
          <button type="button" className="button is-fullwidth" onClick={() => initiateJumpElement(false)} tabIndex={-1}>
            <IoArrowBack/>
          </button>
        </div>
        <div className="control is-expanded">
          <button type="button" className="button is-fullwidth" onClick={() => initiateJumpElement(true)} tabIndex={-1}>
            <IoArrowForward/>
          </button>
        </div>
      </div>
    </>
  );
}