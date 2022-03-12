// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {channelViewObserver} from 'store/channel_subscription';
import {GlobalState} from 'types/store';

import configureStore from './index';

type TestCase = {
    subjectOldValue: string;
    subjectNewValue: string;
    otherValue: string;
    expectedAddValue: string | null;
    expectedRemoveValue: string | null;
};

const rhs = 'rhs';
const center = 'center';

describe('channelViewSubscriptionHandler', () => {
    const store = configureStore();
    const initialState = store.getState();

    const tests2: TestCase[] =
        [
            {
                subjectOldValue: 'x',
                subjectNewValue: 'y',
                otherValue: 'z',
                expectedAddValue: 'y',
                expectedRemoveValue: 'x',
            },
            {
                subjectOldValue: 'y',
                subjectNewValue: 'x',
                otherValue: 'y',
                expectedAddValue: 'x',
                expectedRemoveValue: null,
            },
            {
                subjectOldValue: 'x',
                subjectNewValue: 'y',
                otherValue: 'y',
                expectedAddValue: null,
                expectedRemoveValue: 'x',
            },
        ];

    [center, rhs].forEach((subject) => {
        let subjectUpdater: (state: GlobalState, channelID: string) => GlobalState;
        let otherUpdater: (state: GlobalState, channelID: string) => GlobalState;
        if (subject === center) {
            subjectUpdater = updateCenterChannelID;
            otherUpdater = updateRHSChannelID;
        } else {
            subjectUpdater = updateRHSChannelID;
            otherUpdater = updateCenterChannelID;
        }
        tests2.forEach((tc, i) => {
            test(`subject: ${subject}, tc[${i}]: ${JSON.stringify(tc)}`, () => {
                let state = subjectUpdater(initialState, tc.subjectOldValue);
                state = otherUpdater(state, tc.otherValue);
                channelViewObserver(() => state, () => { }, () => { });
                state = subjectUpdater(state, tc.subjectNewValue);
                const mockAdd = jest.fn();
                const mockRemove = jest.fn();
                channelViewObserver(() => state, mockAdd, mockRemove);
                if (tc.expectedAddValue) {
                    expect(mockAdd.mock.calls.length).toBe(1);
                    expect(mockAdd.mock.calls[0]).toEqual([tc.expectedAddValue]);
                }
                if (tc.expectedRemoveValue) {
                    expect(mockRemove.mock.calls.length).toBe(1);
                    expect(mockRemove.mock.calls[0]).toEqual([tc.expectedRemoveValue]);
                }
            });
        });
    });
});

function updateCenterChannelID(state: GlobalState, channelID: string): GlobalState {
    return {
        ...state,
        entities: {
            ...state.entities,
            channels: {
                ...state.entities.channels,
                currentChannelId: channelID,
            },
        },
    };
}

function updateRHSChannelID(state: GlobalState, channelID: string): GlobalState {
    return {
        ...state,
        views: {
            ...state.views,
            rhs: {
                ...state.views.rhs,
                selectedChannelId: channelID,
            },
        },
    };
}
