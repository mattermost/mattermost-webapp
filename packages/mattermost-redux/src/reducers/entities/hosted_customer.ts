// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import type {ValueOf} from '@mattermost/types/utilities';
import {HostedCustomerTypes} from 'mattermost-redux/action_types';

import {GenericAction} from 'mattermost-redux/types/actions';
import {Product} from '@mattermost/types/cloud';
import {SelfHostedSignupProgress} from '@mattermost/types/hosted_customer';

function products(state: Record<string, Product> = {}, action: GenericAction) {
    switch (action.type) {
    case HostedCustomerTypes.RECEIVED_SELF_HOSTED_PRODUCTS: {
        const productList: Product[] = action.data;
        const productDict = productList.reduce((map, obj) => {
            map[obj.id] = obj;
            return map;
        }, {} as Record<string, Product>);
        return {
            ...state,
            ...productDict,
        };
    }
    default:
        return state;
    }
}

type SignupProgress = ValueOf<typeof SelfHostedSignupProgress>;
function signupProgress(state = SelfHostedSignupProgress.START, action: GenericAction): SignupProgress {
    switch (action.type) {
    case HostedCustomerTypes.RECEIVED_SELF_HOSTED_SIGNUP_PROGRESS:
        return action.data;
    default:
        return state;
    }
}

export interface ErrorsReducer {
    products?: true;
}

const emptyErrors = {};
export function errors(state: ErrorsReducer = emptyErrors, action: GenericAction) {
    switch (action.type) {
    case HostedCustomerTypes.SELF_HOSTED_PRODUCTS_FAILED: {
        return {...state, products: true};
    }
    case HostedCustomerTypes.SELF_HOSTED_PRODUCTS_REQUEST:
    case HostedCustomerTypes.RECEIVED_SELF_HOSTED_PRODUCTS: {
        const newState = Object.assign({}, state);
        delete newState.products;
        return newState;
    }
    default:
        return state;
    }
}

export default combineReducers({
    products,
    signupProgress,
    errors,
});
