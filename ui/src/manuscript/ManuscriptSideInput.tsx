import {MANUSCRIPT_SIDE, ManuscriptSide} from '../graphql';
import {useTranslation} from 'react-i18next';

interface IProps {
  currentSide: ManuscriptSide;
  update: (side: ManuscriptSide) => void;
}

export function ManuscriptSideInput({currentSide, update}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <div className="mb-2 flex flex-row">
      <label htmlFor="manuscriptSide" className="p-2 font-bold">{t('manuscriptSide')}:</label>

      <input type="text" id="manuscriptSide" list="manuscriptSides" defaultValue={currentSide} className="flex-grow p-2 rounded border border-slate-500"
             onChange={(event) => update(event.target.value as ManuscriptSide)}/>

      <datalist id="manuscriptSides">
        {MANUSCRIPT_SIDE.map((side) => <option key={side} value={side}/>)}
      </datalist>
    </div>
  );

}