import {createStore} from 'redux';
import {NEW_LANGUAGES, StoreAction, UPDATE_PREFERENCES, USER_LOGGED_IN, USER_LOGGED_OUT} from './actions';
import {LoggedInUserFragment, ManuscriptLanguageFragment} from '../graphql';
import {defaultEditorKeyConfig, EditorKeyConfig} from '../editor/editorKeyConfig';

const localStorageUserKey = 'userId';
const localStoragePreferencesKey = 'preferences';

interface StoreState {
  currentUser?: LoggedInUserFragment;
  editorKeyConfig?: EditorKeyConfig;
  languages: ManuscriptLanguageFragment[];
}

function rootReducer(store: StoreState = {languages: []}, action: StoreAction): StoreState {
  switch (action.type) {
    case USER_LOGGED_IN:
      localStorage.setItem(localStorageUserKey, JSON.stringify(action.user));
      return {...store, currentUser: action.user};
    case USER_LOGGED_OUT:
      localStorage.removeItem(localStorageUserKey);
      return {...store, currentUser: undefined};
    case UPDATE_PREFERENCES:
      return {...store, editorKeyConfig: action.newPreferences};
    case NEW_LANGUAGES:
      return {...store, languages: action.languages};
    default:
      return store;
  }
}


export function activeUserSelector(store: StoreState): LoggedInUserFragment | undefined {
  return store.currentUser;
}

export function editorKeyConfigSelector(store: StoreState): EditorKeyConfig {
  return store.editorKeyConfig || defaultEditorKeyConfig;
}

export function allManuscriptLanguagesSelector(store: StoreState): ManuscriptLanguageFragment[] {
  return store.languages;
}


function initialState(): StoreState {
  const localStorageUser = localStorage.getItem(localStorageUserKey);
  const localStoragePreferences = localStorage.getItem(localStoragePreferencesKey);

  return {
    currentUser: localStorageUser ? JSON.parse(localStorageUser) : undefined,
    editorKeyConfig: localStoragePreferences ? JSON.parse(localStoragePreferences) : undefined,
    languages: []
  };
}

export const store = createStore(rootReducer, initialState());
