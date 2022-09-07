import {createStore} from 'redux';
import {NEW_LANGUAGES, StoreAction, UPDATE_PREFERENCES, USER_LOGGED_IN, USER_LOGGED_OUT} from './actions';
import {LoggedInUserFragment, ManuscriptLanguageFragment} from '../graphql';
import {defaultEditorKeyConfig, EditorKeyConfig, OldEditorKeyConfig} from '../xmlEditor/editorKeyConfig';

const localStorageUserKey = 'userId';
const localStoragePreferencesKey = 'preferences';
const localStorageLanguagesKey = 'languages';

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
      localStorage.setItem(localStoragePreferencesKey, JSON.stringify(action.newPreferences));
      return {...store, editorKeyConfig: action.newPreferences};
    case NEW_LANGUAGES:
      localStorage.setItem(localStorageLanguagesKey, JSON.stringify(action.languages));
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

function sanitizePreferences(object: OldEditorKeyConfig | EditorKeyConfig): EditorKeyConfig {
  if ('updateAndNextEditableNodeKeys' in object) {
    return object;
  } else {
    return {...object, updateAndPreviousEditableNodeKeys: [], updateAndNextEditableNodeKeys: []};
  }
}


function initialState(): StoreState {
  const localStorageUser = localStorage.getItem(localStorageUserKey);
  const localStoragePreferences = localStorage.getItem(localStoragePreferencesKey);
  const localStorageLanguages = localStorage.getItem(localStorageLanguagesKey);

  return {
    currentUser: localStorageUser ? JSON.parse(localStorageUser) : undefined,
    editorKeyConfig: localStoragePreferences ? sanitizePreferences(JSON.parse(localStoragePreferences)) : undefined,
    languages: localStorageLanguages ? JSON.parse(localStorageLanguages) : []
  };
}

export const store = createStore(rootReducer, initialState());
