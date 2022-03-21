// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {fireEvent, screen} from '@testing-library/react';

import {Channel} from 'mattermost-redux/types/channels';
import {renderWithIntl} from 'tests/react_testing_utils';
import Constants from 'utils/constants';

import Menu from './menu';

describe('channel_info_rhs/menu', () => {
    test('should display notifications preferences', () => {
        const openNotificationSettings = jest.fn();

        renderWithIntl(
            <Menu
                channel={{type: Constants.OPEN_CHANNEL} as Channel}
                isArchived={false}
                actions={{openNotificationSettings}}
            />,
        );

        expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Notification Preferences'));

        expect(openNotificationSettings).toHaveBeenCalled();
    });

    test('should NOT display notifications preferences in a DM', () => {
        const openNotificationSettings = jest.fn();

        renderWithIntl(
            <Menu
                channel={{type: Constants.DM_CHANNEL} as Channel}
                isArchived={false}
                actions={{openNotificationSettings}}
            />,
        );

        expect(screen.queryByText('Notification Preferences')).not.toBeInTheDocument();
    });

    test('should NOT display notifications preferences in an archived channel', () => {
        const openNotificationSettings = jest.fn();

        renderWithIntl(
            <Menu
                channel={{type: Constants.OPEN_CHANNEL} as Channel}
                isArchived={true}
                actions={{openNotificationSettings}}
            />,
        );

        expect(screen.queryByText('Notification Preferences')).not.toBeInTheDocument();
    });
});
