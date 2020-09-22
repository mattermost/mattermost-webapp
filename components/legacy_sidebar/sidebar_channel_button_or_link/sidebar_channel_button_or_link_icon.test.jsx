// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Constants} from 'utils/constants';

import SidebarChannelButtonOrLinkIcon from './sidebar_channel_button_or_link_icon.jsx';

describe('component/legacy_sidebar/sidebar_channel_button_or_link/SidebarChannelButtonOrLinkIcon', () => {
    test('should match snapshot, on direct message', () => {
        const wrapper = shallow(
            <SidebarChannelButtonOrLinkIcon
                channelIsArchived={false}
                channelType={Constants.DM_CHANNEL}
                channelId={'test-channel-id'}
                channelStatus={'test'}
                hasDraft={false}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on archive direct message', () => {
        const wrapper = shallow(
            <SidebarChannelButtonOrLinkIcon
                channelIsArchived={false}
                channelType={Constants.DM_CHANNEL}
                channelId={'test-channel-id'}
                teammateId={'test'}
                teammateDeletedAt={1}
                hasDraft={false}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on group direct message', () => {
        const wrapper = shallow(
            <SidebarChannelButtonOrLinkIcon
                channelIsArchived={false}
                channelType={Constants.GM_CHANNEL}
                channelId={'test-channel-id'}
                membersCount={3}
                hasDraft={false}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on private channel', () => {
        const wrapper = shallow(
            <SidebarChannelButtonOrLinkIcon
                channelIsArchived={false}
                channelType={Constants.PRIVATE_CHANNEL}
                channelId={'test-channel-id'}
                hasDraft={false}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on public channel', () => {
        const wrapper = shallow(
            <SidebarChannelButtonOrLinkIcon
                channelIsArchived={false}
                channelType={Constants.OPEN_CHANNEL}
                channelId={'test-channel-id'}
                hasDraft={false}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on archived public channel', () => {
        const wrapper = shallow(
            <SidebarChannelButtonOrLinkIcon
                channelIsArchived={true}
                channelType={Constants.OPEN_CHANNEL}
                channelId={'test-channel-id'}
                hasDraft={false}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, with draft in public channel', () => {
        const wrapper = shallow(
            <SidebarChannelButtonOrLinkIcon
                channelIsArchived={false}
                channelType={Constants.OPEN_CHANNEL}
                channelId={'test-channel-id'}
                hasDraft={true}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
