// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import * as UserSelectors from 'mattermost-redux/selectors/entities/users';
import * as GeneralSelectors from 'mattermost-redux/selectors/entities/general';

import configureStore from 'store';
import {getCustomStatus, getRecentCustomStatuses, isCustomStatusEnabled} from 'selectors/views/custom_status';

import {TestHelper} from 'utils/test_helper';

jest.mock('mattermost-redux/selectors/entities/users');
jest.mock('mattermost-redux/selectors/entities/general');

const customStatus = {
    emoji: 'speech_balloon',
    text: 'speaking',
};

describe('getCustomStatus', () => {
    const user = TestHelper.getUserMock();

    it('should return empty object when there is no custom status', async () => {
        const store = await configureStore();
        (UserSelectors.getCurrentUser as jest.Mock).mockReturnValue(user);
        expect(getCustomStatus(store.getState(), '')).toStrictEqual({});
    });

    it('should return empty object when user with given id has no custom status set', async () => {
        const store = await configureStore();
        (UserSelectors.getUser as jest.Mock).mockReturnValue(user);
        expect(getCustomStatus(store.getState(), user.id)).toStrictEqual({});
    });

    it('should return customStatus object when there is custom status set', async () => {
        const store = await configureStore();
        user.props.customStatus = JSON.stringify(customStatus);
        (UserSelectors.getCurrentUser as jest.Mock).mockReturnValue(user);
        expect(getCustomStatus(store.getState(), '')).toStrictEqual(customStatus);
    });
});

describe('getRecentCustomStatuses', () => {
    const user = TestHelper.getUserMock();

    it('should return empty arr if there are no recent custom statuses', async () => {
        const store = await configureStore();
        (UserSelectors.getUser as jest.Mock).mockReturnValue(user);
        expect(getRecentCustomStatuses(store.getState(), user.id)).toStrictEqual([]);
    });

    it('should return arr of custom statuses if there are recent custom statuses', async () => {
        const store = await configureStore();
        user.props.recentCustomStatuses = JSON.stringify([customStatus]);
        (UserSelectors.getUser as jest.Mock).mockReturnValue(user);
        expect(getRecentCustomStatuses(store.getState(), user.id)).toStrictEqual([customStatus]);
    });
});

describe('isCustomStatusEnabled', () => {
    const config = {
        EnableCustomUserStatuses: 'true',
    };

    it('should return true if EnableCustomUserStatuses is true in the config', async () => {
        const store = await configureStore();
        expect(isCustomStatusEnabled(store.getState())).toBeFalsy();
    });

    it('should return true if EnableCustomUserStatuses is true in the config', async () => {
        const store = await configureStore();
        (GeneralSelectors.getConfig as jest.Mock).mockReturnValue(config);
        expect(isCustomStatusEnabled(store.getState())).toBeTruthy();
    });
});
