// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {screen} from '@testing-library/react';

import {GlobalState} from '@mattermost/types/store';

import {renderWithIntlAndStore} from 'tests/react_testing_utils';
import {TestHelper} from 'utils/test_helper';

import LegacyMattermostCloudBar from './';

const baseState = {
    entities: {
        cloud: {
            subscription: undefined,
            limits: {
                limitsLoaded: true,
                limits: {},
            },
        },
        users: {
            currentUserId: 'me',
            profiles: {
                me: TestHelper.getUserMock({
                    id: 'me',
                }),
            },

        },
        general: {
            license: {},
        },
    },
    views: {
        announcementBar: {
            announcementBarState: {
                announcementBarCount: 0,
            },
        },
    },
} as unknown as GlobalState;

describe('LegacyMattermostCloudBar', () => {
    it('shows bar to cloud admins of legacy mattermost cloud workspaces', () => {
        const state = JSON.parse(JSON.stringify(baseState));
        state.entities.cloud.subscription = TestHelper.getSubscriptionMock({
            product_id: 'prod_HyiHEAVKW5bYG3',
        });
        state.entities.users.profiles.me.roles = 'system_admin';
        renderWithIntlAndStore(<LegacyMattermostCloudBar/>, state);
        screen.getByText('no longer be supported starting November 1', {exact: false});
    });

    it('non-admins do not see bar', () => {
        const state = JSON.parse(JSON.stringify(baseState));
        state.entities.cloud.subscription = TestHelper.getSubscriptionMock({
            product_id: 'prod_HyiHEAVKW5bYG3',
        });
        renderWithIntlAndStore(<LegacyMattermostCloudBar/>, state);
        expect(screen.queryByText('no longer be supported starting November 1', {exact: false})).not.toBeInTheDocument();
    });

    it('non-legacy cloud workspaces do not see bar', () => {
        const state = JSON.parse(JSON.stringify(baseState));
        state.entities.cloud.subscription = TestHelper.getSubscriptionMock({
            product_id: 'prod_non_legacy',
        });
        state.entities.users.profiles.me.roles = 'system_admin';
        renderWithIntlAndStore(<LegacyMattermostCloudBar/>, state);
        expect(screen.queryByText('no longer be supported starting November 1', {exact: false})).not.toBeInTheDocument();
    });

    it('self-hosted workspaces do not see bar', () => {
        const state = JSON.parse(JSON.stringify(baseState));
        state.entities.users.profiles.me.roles = 'system_admin';
        renderWithIntlAndStore(<LegacyMattermostCloudBar/>, state);
        expect(screen.queryByText('no longer be supported starting November 1', {exact: false})).not.toBeInTheDocument();
    });
});

