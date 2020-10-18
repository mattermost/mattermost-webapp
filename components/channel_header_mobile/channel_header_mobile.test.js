// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ChannelHeaderMobile from './channel_header_mobile';

describe('components/ChannelHeaderMobile/ChannelHeaderMobile', () => {
    global.document.querySelector = jest.fn().mockReturnValue({
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
    });

    const baseProps = {
        user: {
            id: 'user_id',
        },
        channel: {type: 'O', id: 'channel_id', display_name: 'display_name', team_id: 'team_id'},
        member: {id: 'member_id'},
        teamDisplayName: 'team_display_name',
        isPinnedPosts: true,
        actions: {
            closeLhs: jest.fn(),
            closeRhs: jest.fn(),
            closeRhsMenu: jest.fn(),
            leaveChannel: jest.fn(),
            markFavorite: jest.fn(),
            showPinnedPosts: jest.fn(),
            toggleLhs: jest.fn(),
            toggleRhsMenu: jest.fn(),
            unmarkFavorite: jest.fn(),
            updateChannelNotifyProps: jest.fn(),
            updateRhsState: jest.fn(),
        },
        isLicensed: true,
        isFavoriteChannel: false,
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <ChannelHeaderMobile {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, for default channel', () => {
        const props = {
            ...baseProps,
            channel: {type: 'O', id: '123', name: 'town-square', display_name: 'Town Square', team_id: 'team_id'},
        };
        const wrapper = shallow(
            <ChannelHeaderMobile {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, if not licensed', () => {
        const wrapper = shallow(
            <ChannelHeaderMobile
                {...baseProps}
                isLicensed={false}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, if enabled WebRTC and DM channel', () => {
        const props = {
            ...baseProps,
            channel: {type: 'D', id: 'channel_id', name: 'user_id_1__user_id_2', display_name: 'display_name', team_id: 'team_id'},
            enableWebrtc: true,
        };
        const wrapper = shallow(<ChannelHeaderMobile {...props}/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, if WebRTC is not enabled', () => {
        const props = {
            ...baseProps,
            enableWebrtc: false,
        };
        const wrapper = shallow(<ChannelHeaderMobile {...props}/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, for private channel', () => {
        const props = {
            ...baseProps,
            channel: {type: 'P', id: 'channel_id', display_name: 'display_name', team_id: 'team_id'},
        };
        const wrapper = shallow(<ChannelHeaderMobile {...props}/>);

        expect(wrapper).toMatchSnapshot();
    });
});
