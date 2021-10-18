// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {combineReducers} from 'redux';

import {AppsTypes} from 'mattermost-redux/action_types';
import {AppBinding, AppCommandFormMap, AppsState} from 'mattermost-redux/types/apps';
import {GenericAction} from 'mattermost-redux/types/actions';
import {validateBindings} from 'mattermost-redux/utils/apps';

// This file's contents belong to the Apps Framework feature.
// Apps Framework feature is experimental, and the contents of this file are
// susceptible to breaking changes without pushing the major version of this package.

export function mainBindings(state: AppBinding[] = [], action: GenericAction): AppBinding[] {
    switch (action.type) {
    case AppsTypes.RECEIVED_APP_BINDINGS: {
        const bindings = action.data;
        return validateBindings(bindings);
    }
    default:
        return state;
    }
}

function mainForms(state: AppCommandFormMap = {}, action: GenericAction): AppCommandFormMap {
    switch (action.type) {
    case AppsTypes.RECEIVED_APP_BINDINGS:
        return {};
    case AppsTypes.RECEIVED_APP_COMMAND_FORM: {
        const {form, location} = action.data;
        const newState = {
            ...state,
            [location]: form,
        };
        return newState;
    }
    default:
        return state;
    }
}

const main = combineReducers({
    bindings: mainBindings,
    forms: mainForms,
});

function rhsBindings(state: AppBinding[] = [], action: GenericAction): AppBinding[] {
    switch (action.type) {
    case AppsTypes.RECEIVED_APP_RHS_BINDINGS: {
        const bindings = action.data;
        return validateBindings(bindings);
    }
    default:
        return state;
    }
}

function rhsForms(state: AppCommandFormMap = {}, action: GenericAction): AppCommandFormMap {
    switch (action.type) {
    case AppsTypes.RECEIVED_APP_RHS_BINDINGS:
        return {};
    case AppsTypes.RECEIVED_APP_RHS_COMMAND_FORM: {
        const {form, location} = action.data;
        const newState = {
            ...state,
            [location]: form,
        };
        return newState;
    }
    default:
        return state;
    }
}

const rhs = combineReducers({
    bindings: rhsBindings,
    forms: rhsForms,
});

export default (combineReducers({
    main,
    rhs,
}) as (b: AppsState, a: GenericAction) => AppsState);
