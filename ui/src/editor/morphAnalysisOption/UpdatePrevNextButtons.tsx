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
        <button type="button" className="button is-link is-fullwidth" onClick={initiateUpdate}>{t('update')}</button>
      </div>

      <div className="field has-addons">
        <div className="control is-expanded">
          <button type="button" className="button is-fullwidth" onClick={() => initiateJumpElement(false)}><IoArrowBack/></button>
        </div>
        <div className="control is-expanded">
          <button type="button" className="button is-fullwidth" onClick={() => initiateJumpElement(true)}><IoArrowForward/></button>
        </div>
      </div>
    </>
  );
}