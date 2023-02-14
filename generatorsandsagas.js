// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {random} from 'lodash';
import { Client4 } from 'mattermost-redux/client';

/* eslint-disable */

function doStep(n) {
    console.log(`Doing step ${n}`);
    return n;
}

function* doSomethingInSteps() {
    yield doStep(1);
    yield doStep(2);
    yield doStep(3);
}

const coroutine = doSomethingInSteps(); // Prints nothing

coroutine.next(); // Prints "Doing step 1" and returns {value: 1, done: false}
coroutine.next(); // Prints "Doing step 2" and returns {value: 2, done: false}
coroutine.next(); // Prints "Doing step 3" and returns {value: 3, done: false}
coroutine.next(); // Prints nothing and returns {value: undefined, done: true}

function* makePi() {
    yield 3;
    yield '.';
    yield 1;
    yield 4;
    yield 1;
    yield 5;
    yield 9;

    while (true) {
        yield random(0, 9);
    }
}

const pi = makePi();

console.log(pi().next().value); // Prints 3
console.log(pi().next().value); // Prints .
console.log(pi().next().value); // Prints 1
console.log(pi().next().value); // Prints 4
console.log(pi().next().value); // Prints 1
console.log(pi().next().value); // Prints 5
console.log(pi().next().value); // Prints 9
console.log(pi().next().value); // Prints the 100% correct next digit

for (const digit of makePi()) {
    console.log(digit);
}


function* receiveWebSocketEvents() {
    const state = 'disconnected';

    while (state !== 'closed') {
        switch(state) {
            case 'disconnected':
            case 'error':
                connectWebSocket();
                state = 'connected';
                break;
            case 'connected':
                let event;
                try {
                    event = getNextWebSocketEvent();

                    if (event === 'close') {
                        state = 'closed';
                    } else {
                        yield event;
                    }
                } catch {
                    state = 'error';
                }
                break;
        }
    }
}

receiveWebSocketEvents();
sessionSaga();

import {put, take} from 'redux-saga/effects';

function* pingSaga() {
    while (true) {
        yield take('DO_PING_REQUEST');

        yield put('PING_REQUEST');

        const result = yield call(Client4.ping());

        if (result.error) {
            yield put('PING_ERROR');
        } else {
            yield put('PING_SUCCESS');
        }
    }
}
