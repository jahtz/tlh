import {createStore} from 'redux';
import {StoreAction, UPDATE_PREFERENCES, USER_LOGGED_IN, USER_LOGGED_OUT} from './actions';
import {LoggedInUserFragment} from '../graphql';
import {defaultEditorConfig, EditorConfig} from '../editor/editorConfig';

const localStorageUserKey = 'userId';
const localStoragePreferencesKey = 'preferences';

interface StoreState {
  currentUser?: LoggedInUserFragment;
  editorConfig?: EditorConfig;
}

function rootReducer(store: StoreState = {}, action: StoreAction): StoreState {
  switch (action.type) {
    case USER_LOGGED_IN:
      localStorage.setItem(localStorageUserKey, JSON.stringify(action.user));
      return {...store, currentUser: action.user};
    case USER_LOGGED_OUT:
      localStorage.removeItem(localStorageUserKey);
      return {...store, currentUser: undefined};
    case UPDATE_PREFERENCES:
      return {...store, editorConfig: action.newPreferences};
    default:
      return store;
  }
}


export function activeUserSelector(store: StoreState): LoggedInUserFragment | undefined {
  return store.currentUser;
}

export function editorConfigSelector(store: StoreState): EditorConfig {
  return store.editorConfig || defaultEditorConfig;
}


function initialState(): StoreState {
  const localStorageUser = localStorage.getItem(localStorageUserKey);
  const currentUser = localStorageUser ? JSON.parse(localStorageUser) : undefined;

  const localStoragePreferences = localStorage.getItem(localStoragePreferencesKey);
  const editorConfig = localStoragePreferences ? JSON.parse(localStoragePreferences) : undefined;

  return {currentUser, editorConfig};
}

export const store = createStore(rootReducer, initialState());
