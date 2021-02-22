// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import * as UserSelectors from 'mattermost-redux/selectors/entities/users';
import * as GeneralSelectors from 'mattermost-redux/selectors/entities/general';
import * as PreferenceSelectors from 'mattermost-redux/selectors/entities/preferences';
import {Preferences} from 'mattermost-redux/constants';

import configureStore from 'store';
import {makeGetCustomStatus, getRecentCustomStatuses, isCustomStatusEnabled, showStatusDropdownPulsatingDot, showPostHeaderUpdateStatusButton} from 'selectors/views/custom_status';

import {TestHelper} from 'utils/test_helper';

jest.mock('mattermost-redux/selectors/entities/users');
jest.mock('mattermost-redux/selectors/entities/general');
jest.mock('mattermost-redux/selectors/entities/preferences');

const customStatus = {
    emoji: 'speech_balloon',
    text: 'speaking',
};

describe('getCustomStatus', () => {
    const user = TestHelper.getUserMock();
    const getCustomStatus = makeGetCustomStatus();

    it('should return undefined when there is no custom status', async () => {
        const store = await configureStore();
        (UserSelectors.getCurrentUser as jest.Mock).mockReturnValue(user);
        expect(getCustomStatus(store.getState())).toBeUndefined();
    });

    it('should return undefined when user with given id has no custom status set', async () => {
        const store = await configureStore();
        (UserSelectors.getUser as jest.Mock).mockReturnValue(user);
        expect(getCustomStatus(store.getState(), user.id)).toBeUndefined();
    });

    it('should return customStatus object when there is custom status set', async () => {
        const store = await configureStore();
        const newUser = {...user};
        newUser.props.customStatus = JSON.stringify(customStatus);
        (UserSelectors.getCurrentUser as jest.Mock).mockReturnValue(newUser);
        expect(getCustomStatus(store.getState())).toStrictEqual(customStatus);
    });
});

describe('getRecentCustomStatuses', () => {
    const preference = {
        myPreference: {
            value: JSON.stringify([]),
        },
    };

    it('should return empty arr if there are no recent custom statuses', async () => {
        const store = await configureStore();
        (PreferenceSelectors.get as jest.Mock).mockReturnValue(preference.myPreference.value);
        expect(getRecentCustomStatuses(store.getState())).toStrictEqual([]);
    });

    it('should return arr of custom statuses if there are recent custom statuses', async () => {
        const store = await configureStore();
        preference.myPreference.value = JSON.stringify([customStatus]);
        (PreferenceSelectors.get as jest.Mock).mockReturnValue(preference.myPreference.value);
        expect(getRecentCustomStatuses(store.getState())).toStrictEqual([customStatus]);
    });
});

describe('isCustomStatusEnabled', () => {
    const config = {
        EnableCustomUserStatuses: 'true',
    };

    it('should return false if EnableCustomUserStatuses is false in the config', async () => {
        const store = await configureStore();
        expect(isCustomStatusEnabled(store.getState())).toBeFalsy();
    });

    it('should return true if EnableCustomUserStatuses is true in the config', async () => {
        const store = await configureStore();
        (GeneralSelectors.getConfig as jest.Mock).mockReturnValue(config);
        expect(isCustomStatusEnabled(store.getState())).toBeTruthy();
    });
});

describe('showStatusDropdownPulsatingDot and showPostHeaderUpdateStatusButton', () => {
    const preference = {
        myPreference: {
            value: '',
        },
    };

    it('should return true if user has not opened the custom status modal before', async () => {
        const store = await configureStore();
        (PreferenceSelectors.get as jest.Mock).mockReturnValue(preference.myPreference.value);
        expect(showStatusDropdownPulsatingDot(store.getState())).toBeTruthy();
    });

    it('should return false if user has opened the custom status modal before', async () => {
        const store = await configureStore();
        preference.myPreference.value = JSON.stringify({[Preferences.CUSTOM_STATUS_MODAL_VIEWED]: true});
        (PreferenceSelectors.get as jest.Mock).mockReturnValue(preference.myPreference.value);
        expect(showPostHeaderUpdateStatusButton(store.getState())).toBeFalsy();
    });
});
