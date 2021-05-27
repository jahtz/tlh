// Column

export enum ManuscriptColumn {
  None = 'None',
  I = 'I',
  Ii = 'II',
  Iii = 'III',
  Iv = 'IV',
  V = 'V',
  Vi = 'VI',
  Vii = 'VII',
  Viii = 'VIII',
  Ix = 'IX',
  X = 'X',
  Xi = 'XI',
  Xii = 'XII',
  LeftColumn = 'LeftColumn',
  MiddleColumn = 'MiddleColumn',
  RightColumn = 'RightColumn',
  ColumnDivider = 'ColumnDivider'
}

export const manuscriptColumns: ManuscriptColumn[] = [
  ManuscriptColumn.None,
  ManuscriptColumn.I, ManuscriptColumn.Ii, ManuscriptColumn.Iii, ManuscriptColumn.Iv,
  ManuscriptColumn.V, ManuscriptColumn.Vi, ManuscriptColumn.Vii, ManuscriptColumn.Viii,
  ManuscriptColumn.Ix, ManuscriptColumn.X, ManuscriptColumn.Xi, ManuscriptColumn.Xii,
  ManuscriptColumn.LeftColumn, ManuscriptColumn.MiddleColumn, ManuscriptColumn.RightColumn,
  ManuscriptColumn.ColumnDivider
];

export function getXmlNameForManuscriptColumn(c: ManuscriptColumn, m: ManuscriptColumnModifier): string {
  const modName = getXmlNameForManuscriptColumnModifier(m);
  return c !== ManuscriptColumn.None ? c + modName : '';
}

// Column Modifier

export enum ManuscriptColumnModifier {
  None = 'None',
  Slash = 'Slash',
  SlashQuestion = 'SlashQuestion'
}

export const manuscriptColumnModifiers: ManuscriptColumnModifier[] = [
  ManuscriptColumnModifier.None, ManuscriptColumnModifier.Slash, ManuscriptColumnModifier.SlashQuestion
];

function getXmlNameForManuscriptColumnModifier(m: ManuscriptColumnModifier): string {
  switch (m) {
    case ManuscriptColumnModifier.None:
      return '';
    case ManuscriptColumnModifier.Slash:
      return "'";
    case ManuscriptColumnModifier.SlashQuestion:
      return "'?";
  }
}