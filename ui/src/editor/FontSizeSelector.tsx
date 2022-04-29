import {useTranslation} from 'react-i18next';

const FONT_STEP = 10;

interface IProps {
  currentFontSize: number;
  updateFontSize: (delta: number) => void;
}

export function FontSizeSelector({currentFontSize, updateFontSize}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <>
      <button type="button" className="px-2 border border-slate-500 rounded-l" onClick={() => updateFontSize(-FONT_STEP)} title={t('decreaseFontSize')}>
        -{FONT_STEP}%
      </button>
      <button className="px-2 border border-slate-500" disabled>{currentFontSize}%</button>
      <button type="button" className="mr-2 px-2 border border-slate-500 rounded-r" onClick={() => updateFontSize(FONT_STEP)} title={t('increaseFontSize')}>
        +{FONT_STEP}%
      </button>
    </>
  );
}