// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {render} from '@testing-library/react';

import ChannelController, {getClassnamesForBody} from './channel_controller';

jest.mock('components/announcement_bar', () => () => <div/>);
jest.mock('components/system_notice', () => () => <div/>);
jest.mock('components/reset_status_modal', () => () => <div/>);
jest.mock('components/sidebar_right', () => () => <div/>);
jest.mock('components/sidebar_right_menu', () => () => <div/>);
jest.mock('components/app_bar/app_bar', () => () => <div/>);
jest.mock('components/sidebar', () => () => <div/>);
jest.mock('components/channel_layout/center_channel', () => () => <div/>);
jest.mock('components/loading_screen', () => () => <div/>);
jest.mock('components/favicon_title_handler', () => () => <div/>);
jest.mock('components/product_notices_modal', () => () => <div/>);
jest.mock('plugins/pluggable', () => () => <div/>);

describe('components/channel_layout/ChannelController', () => {
    test('Should have app__body and channel-view classes by default', () => {
        expect(getClassnamesForBody('')).toEqual(['app__body', 'channel-view']);
    });

    test('Should have os--windows class on body for windows 32 or windows 64', () => {
        expect(getClassnamesForBody('Win32')).toEqual(['app__body', 'channel-view', 'os--windows']);
        expect(getClassnamesForBody('Win64')).toEqual(['app__body', 'channel-view', 'os--windows']);
    });

    test('Should have os--mac class on body for MacIntel or MacPPC', () => {
        expect(getClassnamesForBody('MacIntel')).toEqual(['app__body', 'channel-view', 'os--mac']);
        expect(getClassnamesForBody('MacPPC')).toEqual(['app__body', 'channel-view', 'os--mac']);
    });

    test('Should add .app-bar-enabled class when app bar is enabled', () => {
        const {container} = render(
            <ChannelController
                fetchingChannels={false}
                shouldShowAppBar={true}
            />,
        );
        expect(container.getElementsByClassName('app-bar-enabled')).toHaveLength(1);
    });

    test('Should not add .app-bar-enabled class when app bar is disabled', () => {
        const {container} = render(
            <ChannelController
                fetchingChannels={false}
                shouldShowAppBar={false}
            />,
        );

        expect(container.getElementsByClassName('app-bar-enabled')).toHaveLength(0);
    });
});
