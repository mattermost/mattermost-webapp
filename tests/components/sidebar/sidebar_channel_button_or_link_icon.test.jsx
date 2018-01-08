// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Constants} from 'utils/constants.jsx';

import SidebarChannelButtonOrLinkIcon from 'components/sidebar/sidebar_channel_button_or_link/sidebar_channel_button_or_link_icon.jsx';

describe('component/sidebar/sidebar_channel_button_or_link/SidebarChannelButtonOrLinkIcon', () => {
    test('should match snapshot, on direct message', () => {
        const wrapper = shallow(
            <SidebarChannelButtonOrLinkIcon
                channelType={Constants.DM_CHANNEL}
                channelId={'test-channel-id'}
                channelStatus={'test'}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on archive direct message', () => {
        const wrapper = shallow(
            <SidebarChannelButtonOrLinkIcon
                channelType={Constants.DM_CHANNEL}
                channelId={'test-channel-id'}
                teammateId={'test'}
                teammateDeletedAt={1}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on group direct message', () => {
        const wrapper = shallow(
            <SidebarChannelButtonOrLinkIcon
                channelType={Constants.GM_CHANNEL}
                channelId={'test-channel-id'}
                membersCount={3}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on private channel', () => {
        const wrapper = shallow(
            <SidebarChannelButtonOrLinkIcon
                channelType={Constants.PRIVATE_CHANNEL}
                channelId={'test-channel-id'}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on public channel', () => {
        const wrapper = shallow(
            <SidebarChannelButtonOrLinkIcon
                channelType={Constants.OPEN_CHANNEL}
                channelId={'test-channel-id'}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});
