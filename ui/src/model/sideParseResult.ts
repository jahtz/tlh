import {ManuscriptColumn, ManuscriptColumnModifier} from "./manuscriptProperties/manuscriptProperties";
import {ManuscriptLanguage} from "./manuscriptProperties/manuscriptLanugage";
import {TransliterationLine} from "./transliterationLine";
import {ManuscriptSide} from "../generated/graphql";

export interface SideBasics {
  side: ManuscriptSide;
  language: ManuscriptLanguage;
  column: ManuscriptColumn;
  columnModifier: ManuscriptColumnModifier;
}

export const defaultSideBasics: SideBasics = {
  side: ManuscriptSide.NotIdentifiable,
  language: ManuscriptLanguage.Hittite,
  column: ManuscriptColumn.None,
  columnModifier: ManuscriptColumnModifier.None
};

/**
 * @deprecated
 */
export interface SideParseResult {
  lineResults: TransliterationLine[];
}