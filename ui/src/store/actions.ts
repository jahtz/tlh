import {Action} from 'redux';
import {LoggedInUserFragment} from "../generated/graphql";

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

interface UserLoggedOutAction extends Action <typeof USER_LOGGED_OUT> {
}

export function userLoggedOutAction(): UserLoggedOutAction {
    return {type: USER_LOGGED_OUT};
}

// all actions

const reduxActionType = '@@redux'

interface InitAction extends Action<typeof reduxActionType> {
}

export type StoreAction = UserLoggedInAction | UserLoggedOutAction | InitAction;