import {Action} from 'redux';
import {LoggedInUserFragment, ManuscriptLanguageFragment} from '../graphql';
import {EditorKeyConfig} from '../editor/editorKeyConfig';

// User logged in

export const USER_LOGGED_IN = 'USER_LOGGED_IN';

interface UserLoggedInAction extends Action<typeof USER_LOGGED_IN> {
  user: LoggedInUserFragment;
}

export function userLoggedInAction(user: LoggedInUserFragment): UserLoggedInAction {
  return {type: USER_LOGGED_IN, user};
}

// User logged out

export const USER_LOGGED_OUT = 'USER_LOGGED_OUT';

type UserLoggedOutAction = Action<typeof USER_LOGGED_OUT>;

export const userLoggedOutAction: UserLoggedOutAction = {type: USER_LOGGED_OUT};

// User updated preferences

export const UPDATE_PREFERENCES = 'UPDATE_PREFERENCES';

interface UpdatePreferencesAction extends Action<typeof UPDATE_PREFERENCES> {
  newPreferences: EditorKeyConfig;
}

export function updatePreferencesAction(newPreferences: EditorKeyConfig): UpdatePreferencesAction {
  return {type: UPDATE_PREFERENCES, newPreferences};
}

// New languages

export const NEW_LANGUAGES = 'NEW_LANGUAGES';

interface NewLanguagesAction extends Action<typeof NEW_LANGUAGES> {
  languages: ManuscriptLanguageFragment[];
}

export function newLanguagesAction(languages: ManuscriptLanguageFragment[]): NewLanguagesAction {
  return {type: NEW_LANGUAGES, languages};
}


// all actions

const reduxActionType = '@@redux';

type InitAction = Action<typeof reduxActionType>;

export type StoreAction = UserLoggedInAction | UserLoggedOutAction | UpdatePreferencesAction | NewLanguagesAction | InitAction;