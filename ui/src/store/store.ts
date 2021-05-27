import {createStore} from 'redux';
import {StoreAction, USER_LOGGED_IN, USER_LOGGED_OUT} from './actions';
import {LoggedInUserFragment} from "../generated/graphql";


const localStorageKey = 'userId';


interface StoreState {
    currentUser?: LoggedInUserFragment;
}


function rootReducer(store: StoreState = {}, action: StoreAction): StoreState {
    switch (action.type) {
        case USER_LOGGED_IN:
            localStorage.setItem(localStorageKey, JSON.stringify(action.user));
            return {...store, currentUser: action.user};
        case USER_LOGGED_OUT:
            localStorage.removeItem(localStorageKey);
            return {...store, currentUser: undefined};
        default:
            return store;
    }
}


export function activeUserSelector(store: StoreState): LoggedInUserFragment | undefined {
    return store.currentUser;
}


function initialState(): StoreState {
    const localStorageItem = localStorage.getItem(localStorageKey);
    return localStorageItem ? {currentUser: JSON.parse(localStorageItem)} : {};
}


export const store = createStore(rootReducer, initialState());
