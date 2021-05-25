// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {Middleware} from 'redux';
import thunk, {ThunkMiddleware} from 'redux-thunk';

export function createMiddleware(): Middleware[] {
    const middleware: ThunkMiddleware[] = [];

    middleware.push(thunk);

    return middleware;
}
