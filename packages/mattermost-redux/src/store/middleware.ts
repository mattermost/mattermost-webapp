// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {Middleware} from 'redux';
import thunk, {ThunkMiddleware} from 'redux-thunk';

const defaultOptions = {
    additionalMiddleware: [],
};
export function createMiddleware(clientOptions: any): Middleware[] {
    const options = Object.assign({}, defaultOptions, clientOptions);
    const {
        additionalMiddleware,
    } = options;
    const middleware: ThunkMiddleware[] = [];

    middleware.push(thunk);

    if (additionalMiddleware) {
        if (typeof additionalMiddleware === 'function') {
            middleware.push(additionalMiddleware);
        } else {
            middleware.push(...additionalMiddleware);
        }
    }

    return middleware;
}
