import {ManuscriptColumn} from '../../graphql';
import {ManuscriptColumnModifier} from './manuscriptColumnModifier';

export const manuscriptColumns: ManuscriptColumn[] = [
  ManuscriptColumn.ColumnDivider,
  ManuscriptColumn.I,
  ManuscriptColumn.Ii,
  ManuscriptColumn.Iii,
  ManuscriptColumn.Iv,
  ManuscriptColumn.Ix,
  ManuscriptColumn.LeftColumn,
  ManuscriptColumn.MiddleColumn,
  ManuscriptColumn.None,
  ManuscriptColumn.RightColumn,
  ManuscriptColumn.V,
  ManuscriptColumn.Vi,
  ManuscriptColumn.Vii,
  ManuscriptColumn.Viii,
  ManuscriptColumn.X,
  ManuscriptColumn.Xi,
  ManuscriptColumn.Xii,
];

export const manuscriptColumnModifiers: ManuscriptColumnModifier[] = [
  ManuscriptColumnModifier.None,
  ManuscriptColumnModifier.Slash,
  ManuscriptColumnModifier.SlashQuestion
];