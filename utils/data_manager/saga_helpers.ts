// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-console, no-warning-comments, func-names */
// TODO remove above the eslint-disable

import {
    actionChannel,
    delay,
    put,
    race,
    StrictEffect,
    take,
} from 'redux-saga/effects';

export interface BatchArgs {
    incoming: string;
    outgoing: string;
    delayBy?: number;
}

export function batchDebounce({incoming, outgoing, delayBy = 100}: BatchArgs) {
    return function* (): Generator<StrictEffect, number, never> {
        const incomingChannel = yield actionChannel(incoming);

        while (true) {
            const firstAction = yield take(incomingChannel);
            console.log('starting first batch');

            const batched = [firstAction];

            while (true) {
                const {action} = yield race({
                    delay: delay(delayBy),
                    action: take(incomingChannel),
                });

                if (action) {
                    console.log('adding fetch');
                    batched.push(action);
                } else {
                    break;
                }
            }

            console.log('doing fetch for batch');
            yield put({type: outgoing, batched});
        }
    };
}

export function batchThrottle({incoming, outgoing, delayBy = 100}: BatchArgs) {
    return function* (): Generator<StrictEffect, number, never> {
        console.log('fetchThing', incoming, outgoing);
        const incomingChannel = yield actionChannel(incoming);

        while (true) {
            const firstAction = yield take(incomingChannel);
            console.log('starting first batch');

            const timeout = delay(delayBy);

            const batched = [firstAction];

            while (true) {
                const {action} = yield race({
                    delay: timeout,
                    action: take(incomingChannel),
                });

                if (action) {
                    console.log('adding fetch');
                    batched.push(action);
                } else {
                    break;
                }
            }

            console.log('doing fetch for batch');
            yield put({type: outgoing, batched});
        }
    };
}
