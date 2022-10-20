import {AnyAction, configureStore, createSlice, EnhancedStore, PayloadAction} from '@reduxjs/toolkit';
import {ManuscriptLanguage, ManuscriptLanguageFragment} from './graphql';
import {defaultEditorKeyConfig, EditorKeyConfig} from './xmlEditor/editorKeyConfig';
import {ThunkMiddlewareFor} from '@reduxjs/toolkit/dist/getDefaultMiddleware';

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  const foundString = localStorage.getItem(key);

  return foundString ? JSON.parse(foundString) : defaultValue;
}

// User slice

const userKey = 'user';

function userFromToken(token: string): User {
  return {
    ...JSON.parse(
      atob(
        token.split('.')[1]
          .replace(/-/g, '+')
          .replace(/_/g, '/')
      )
    ),
    token
  };
}

export interface User {
  user_id: string;
  exp: number;
  iss: string;
  iat: number;
  token: string;
}

const userSlice = createSlice({
  name: 'user',
  initialState: () => ({user: loadFromLocalStorage<User | null>(userKey, null)}),
  reducers: {
    login(state, {payload}: PayloadAction<string>) {
      const user = userFromToken(payload);
      localStorage.setItem(userKey, JSON.stringify(user));
      state.user = user;
    },
    logout(state) {
      localStorage.removeItem(userKey);
      state.user = null;
    }
  }
});

export const {login, logout} = userSlice.actions;

export const activeUserSelector: (store: StoreState) => User | null = ({user}) => user.user;

// Preferences

const editorKeyConfigKey = 'preferences';

const editorKeyConfigSlice = createSlice({
  name: 'editorKeyConfig',
  initialState: () => ({editorKeyConfig: loadFromLocalStorage<EditorKeyConfig>(editorKeyConfigKey, defaultEditorKeyConfig)}),
  reducers: {
    updatePreferences(state, {payload}: PayloadAction<EditorKeyConfig>) {
      localStorage.setItem(editorKeyConfigKey, JSON.stringify(payload));
      state.editorKeyConfig = payload;
    }
  }
});

export const {updatePreferences} = editorKeyConfigSlice.actions;

export const editorKeyConfigSelector: (store: StoreState) => EditorKeyConfig = ({editorKeyConfig}) => editorKeyConfig.editorKeyConfig;

// Languages

const languagesKey = 'languages';

const languages = createSlice({
  name: 'languages',
  initialState: () => ({languages: loadFromLocalStorage<ManuscriptLanguage[]>(languagesKey, [])}),
  reducers: {
    newLanguages(state, {payload}: PayloadAction<ManuscriptLanguage[]>) {
      state.languages = payload;
    }
  }
});

export const {newLanguages} = languages.actions;

export const allManuscriptLanguagesSelector: (store: StoreState) => ManuscriptLanguageFragment[] = ({languages}) => languages.languages;

// Store

interface StoreState {
  user: { user: User | null };
  editorKeyConfig: { editorKeyConfig: EditorKeyConfig };
  languages: { languages: ManuscriptLanguage[] };
}

export const newStore: EnhancedStore<StoreState, AnyAction, [ThunkMiddlewareFor<StoreState>]> = configureStore({
  reducer: {
    user: userSlice.reducer,
    editorKeyConfig: editorKeyConfigSlice.reducer,
    languages: languages.reducer
  }
});

