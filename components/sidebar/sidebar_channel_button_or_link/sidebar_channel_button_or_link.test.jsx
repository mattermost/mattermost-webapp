// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Constants} from 'utils/constants.jsx';
import SidebarChannelButtonOrLink from 'components/sidebar/sidebar_channel_button_or_link/sidebar_channel_button_or_link.jsx';

describe('component/sidebar/sidebar_channel_button_or_link/SidebarChannelButtonOrLink', () => {
    test('should match snapshot, on desktop with mentions badge', () => {
        const wrapper = shallow(
            <SidebarChannelButtonOrLink
                channelType={Constants.DM_CHANNEL}
                channelId={'test-channel-id'}
                channelName={'test-channel-name'}
                channelStatus={'test'}
                link={'test-link'}
                rowClass={'test-class'}
                displayName={'test-channel-name'}
                handleClose={jest.fn()}
                hasDraft={false}
                badge={true}
                membersCount={3}
                showUnreadForMsgs={true}
                unreadMsgs={2}
                unreadMentions={6}
                teammateId={'test-teammate-id'}
                teammateDeletedAt={1}
                channelIsArchived={false}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on desktop with draft', () => {
        const wrapper = shallow(
            <SidebarChannelButtonOrLink
                channelType={Constants.DM_CHANNEL}
                channelId={'test-channel-id'}
                channelName={'test-channel-name'}
                channelStatus={'test'}
                link={'test-link'}
                rowClass={'test-class'}
                displayName={'test-channel-name'}
                handleClose={jest.fn()}
                hasDraft={true}
                badge={false}
                membersCount={3}
                showUnreadForMsgs={true}
                unreadMsgs={2}
                unreadMentions={0}
                teammateId={'test-teammate-id'}
                teammateDeletedAt={1}
                channelIsArchived={false}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on desktop without badge', () => {
        const wrapper = shallow(
            <SidebarChannelButtonOrLink
                channelType={Constants.DM_CHANNEL}
                channelId={'test-channel-id'}
                channelName={'test-channel-name'}
                channelStatus={'test'}
                link={'test-link'}
                rowClass={'test-class'}
                displayName={'test-channel-name'}
                handleClose={jest.fn()}
                hasDraft={false}
                membersCount={3}
                showUnreadForMsgs={true}
                unreadMsgs={2}
                unreadMentions={6}
                teammateId={'test-teammate-id'}
                teammateDeletedAt={1}
                channelIsArchived={false}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should trackEvent, mark and add history entry on desktop on click', () => {
        const browserHistoryMock = require.requireMock('utils/browser_history');
        const diagnosticsActionsMock = require.requireMock('actions/diagnostics_actions.jsx');
        expect(diagnosticsActionsMock.trackEvent).not.toBeCalled();
        expect(diagnosticsActionsMock.mark).not.toBeCalled();
        expect(browserHistoryMock.browserHistory.push).not.toBeCalled();
    });

    test('should match snapshot, on non-desktop with mentions badge', () => {
        const userAgentMock = require.requireMock('utils/user_agent');
        userAgentMock.isDesktopApp.mockImplementation(() => false);

        const wrapper = shallow(
            <SidebarChannelButtonOrLink
                channelType={Constants.DM_CHANNEL}
                channelId={'test-channel-id'}
                channelName={'test-channel-name'}
                channelStatus={'test'}
                link={'test-link'}
                rowClass={'test-class'}
                displayName={'test-channel-name'}
                handleClose={jest.fn()}
                hasDraft={false}
                badge={true}
                membersCount={3}
                showUnreadForMsgs={true}
                unreadMsgs={2}
                unreadMentions={6}
                teammateId={'test-teammate-id'}
                teammateDeletedAt={1}
                channelIsArchived={false}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on non-desktop without badge', () => {
        const userAgentMock = require.requireMock('utils/user_agent');
        userAgentMock.isDesktopApp.mockImplementation(() => false);

        const wrapper = shallow(
            <SidebarChannelButtonOrLink
                channelType={Constants.DM_CHANNEL}
                channelId={'test-channel-id'}
                channelName={'test-channel-name'}
                channelStatus={'test'}
                link={'test-link'}
                rowClass={'test-class'}
                displayName={'test-channel-name'}
                handleClose={jest.fn()}
                hasDraft={false}
                membersCount={3}
                showUnreadForMsgs={true}
                unreadMsgs={2}
                unreadMentions={6}
                teammateId={'test-teammate-id'}
                teammateDeletedAt={1}
                channelIsArchived={false}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should trackEvent and mark but not add history entry on non-desktop on click', () => {
        const userAgentMock = require.requireMock('utils/user_agent');
        userAgentMock.isDesktopApp.mockImplementation(() => false);

        const browserHistoryMock = require.requireMock('utils/browser_history');
        const diagnosticsActionsMock = require.requireMock('actions/diagnostics_actions.jsx');
        expect(diagnosticsActionsMock.trackEvent).not.toBeCalled();
        expect(diagnosticsActionsMock.mark).not.toBeCalled();
        expect(browserHistoryMock.browserHistory.push).not.toBeCalled();
    });

    test('should match snapshot, on group channel with tooltip', () => {
        const wrapper = shallow(
            <SidebarChannelButtonOrLink
                channelType={Constants.GM_CHANNEL}
                channelId={'test-channel-id'}
                channelName={'test-channel-name'}
                channelStatus={'test'}
                link={'test-link'}
                rowClass={'test-class'}
                displayName={'test-channel-name'}
                handleClose={jest.fn()}
                hasDraft={false}
                membersCount={3}
                showUnreadForMsgs={true}
                unreadMsgs={2}
                unreadMentions={6}
                teammateId={'test-teammate-id'}
                teammateDeletedAt={1}
                channelIsArchived={false}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});
