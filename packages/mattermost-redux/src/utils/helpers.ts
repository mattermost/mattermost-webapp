// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import shallowEqual from 'shallow-equals';

import * as reselect from 'reselect';

// eslint-disable-next-line @typescript-eslint/ban-types
export function memoizeResult<F extends Function>(func: F, measure: Function | undefined = undefined): F {
    let lastArgs: IArguments|null = null;
    let lastResult: any = null;

    // we reference arguments instead of spreading them for performance reasons
    return function memoizedFunc() {
        if (!shallowEqual(lastArgs, arguments)) { //eslint-disable-line prefer-rest-params
            //eslint-disable-line prefer-rest-params
            // apply arguments instead of spreading for performance.
            const result = Reflect.apply(func, null, arguments); //eslint-disable-line prefer-rest-params
            if (!shallowEqual(lastResult, result)) {
                lastResult = result;
            }
        }

        if (measure) {
            measure();
        }

        lastArgs = arguments; //eslint-disable-line prefer-rest-params
        return lastResult;
    } as unknown as F;
}

// Use this selector when you want a shallow comparison of the arguments and you want to memoize the result
// try and use this only when your selector returns an array of ids
export const createIdsSelector = reselect.createSelectorCreator(memoizeResult);

// Use this selector when you want a shallow comparison of the arguments and you don't need to memoize the result
export const createShallowSelector = reselect.createSelectorCreator(reselect.defaultMemoize, shallowEqual as any);

// Generates a RFC-4122 version 4 compliant globally unique identifier.
export function generateId(): string {
    // implementation taken from http://stackoverflow.com/a/2117523
    let id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    id = id.replace(/[xy]/g, (c) => {
        const r = Math.floor(Math.random() * 16);
        let v;

        if (c === 'x') {
            v = r;
        } else {
            // eslint-disable-next-line no-mixed-operators
            v = r & 0x3 | 0x8;
        }

        return v.toString(16);
    });
    return id;
}

export function isEmail(email: string): boolean {
    // writing a regex to match all valid email addresses is really, really hard. (see http://stackoverflow.com/a/201378)
    // this regex ensures:
    // - at least one character that is not a space, comma, or @ symbol
    // - followed by a single @ symbol
    // - followed by at least one character that is not a space, comma, or @ symbol
    // this prevents <Outlook Style> outlook.style@domain.com addresses and multiple comma-separated addresses from being accepted
    return (/^[^ ,@]+@[^ ,@]+$/).test(email);
}
