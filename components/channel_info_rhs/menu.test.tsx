// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {fireEvent, screen} from '@testing-library/react';

import {Channel, ChannelStats} from 'mattermost-redux/types/channels';
import {renderWithIntl} from 'tests/react_testing_utils';
import Constants from 'utils/constants';

import Menu from './menu';

describe('channel_info_rhs/menu', () => {
    const defaultProps = {
        channel: {type: Constants.OPEN_CHANNEL} as Channel,
        channelStats: {files_count: 3} as ChannelStats,
        isArchived: false,
        actions: {
            openNotificationSettings: jest.fn(),
            showChannelFiles: jest.fn(),
        },
    };

    beforeEach(() => {
        defaultProps.actions = {
            openNotificationSettings: jest.fn(),
            showChannelFiles: jest.fn(),
        };
    });

    test('should display notifications preferences', () => {
        const props = {...defaultProps};
        props.actions.openNotificationSettings = jest.fn();

        renderWithIntl(
            <Menu
                {...props}
            />,
        );

        expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Notification Preferences'));

        expect(props.actions.openNotificationSettings).toHaveBeenCalled();
    });

    test('should NOT display notifications preferences in a DM', () => {
        const props = {
            ...defaultProps,
            channel: {type: Constants.DM_CHANNEL} as Channel,
        };

        renderWithIntl(
            <Menu
                {...props}
            />,
        );

        expect(screen.queryByText('Notification Preferences')).not.toBeInTheDocument();
    });

    test('should NOT display notifications preferences in an archived channel', () => {
        const props = {
            ...defaultProps,
            isArchived: true,
        };

        renderWithIntl(
            <Menu
                {...props}
            />,
        );

        expect(screen.queryByText('Notification Preferences')).not.toBeInTheDocument();
    });

    test('should display the number of files', () => {
        const props = {...defaultProps};
        props.actions.showChannelFiles = jest.fn();

        renderWithIntl(
            <Menu
                {...props}
            />,
        );

        const fileItem = screen.getByText('Files');
        expect(fileItem).toBeInTheDocument();
        expect(fileItem.parentElement).toHaveTextContent('3');

        fireEvent.click(fileItem);
        expect(props.actions.showChannelFiles).toHaveBeenCalled();
    });
});
