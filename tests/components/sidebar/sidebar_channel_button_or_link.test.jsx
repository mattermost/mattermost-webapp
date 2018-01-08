// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Constants} from 'utils/constants.jsx';

jest.mock('actions/diagnostics_actions.jsx', () => {
    return {
        trackEvent: jest.fn(),
        mark: jest.fn()
    };
});

jest.mock('react-router', () => {
    const original = require.requireActual('react-router');
    return {
        ...original,
        browserHistory: {
            push: jest.fn()
        }
    };
});

jest.mock('utils/user_agent.jsx', () => {
    const original = require.requireActual('utils/user_agent.jsx');
    return {
        ...original,
        isDesktopApp: jest.fn(() => true)
    };
});

import SidebarChannelButtonOrLink from 'components/sidebar/sidebar_channel_button_or_link/sidebar_channel_button_or_link.jsx';

describe('component/sidebar/sidebar_channel_button_or_link/SidebarChannelButtonOrLink', () => {
    test('should match snapshot, on desktop with mentions badge', () => {
        const wrapper = shallow(
            <SidebarChannelButtonOrLink
                channelType={Constants.DM_CHANNEL}
                channelId={'test-channel-id'}
                channelStatus={'test'}
                link={'test-link'}
                rowClass={'test-class'}
                displayName={'test-channel-name'}
                handleClose={jest.fn()}
                badge={true}
                membersCount={3}
                unreadMentions={6}
                teammateId={'test-teammate-id'}
                teammateDeletedAt={1}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on desktop without badge', () => {
        const wrapper = shallow(
            <SidebarChannelButtonOrLink
                channelType={Constants.DM_CHANNEL}
                channelId={'test-channel-id'}
                channelStatus={'test'}
                link={'test-link'}
                rowClass={'test-class'}
                displayName={'test-channel-name'}
                handleClose={jest.fn()}
                membersCount={3}
                unreadMentions={6}
                teammateId={'test-teammate-id'}
                teammateDeletedAt={1}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should trackEvent, mark and add history entry on desktop on click', () => {
        const wrapper = shallow(
            <SidebarChannelButtonOrLink
                channelType={Constants.DM_CHANNEL}
                channelId={'test-channel-id'}
                channelStatus={'test'}
                link={'test-link'}
                rowClass={'test-class'}
                displayName={'test-channel-name'}
                handleClose={jest.fn()}
                membersCount={3}
                unreadMentions={6}
                teammateId={'test-teammate-id'}
                teammateDeletedAt={1}
            />
        );
        const reactRouterMock = require.requireMock('react-router');
        const diagnosticsActionsMock = require.requireMock('actions/diagnostics_actions.jsx');
        expect(diagnosticsActionsMock.trackEvent).not.toBeCalled();
        expect(diagnosticsActionsMock.mark).not.toBeCalled();
        expect(reactRouterMock.browserHistory.push).not.toBeCalled();
        wrapper.find('button').simulate('click');
        expect(diagnosticsActionsMock.trackEvent).toBeCalledWith('ui', 'ui_channel_selected');
        expect(diagnosticsActionsMock.mark).toBeCalledWith('SidebarChannelLink#click');
        expect(reactRouterMock.browserHistory.push).toBeCalledWith('test-link');
    });

    test('should match snapshot, on non-desktop with mentions badge', () => {
        const userAgentMock = require.requireMock('utils/user_agent');
        userAgentMock.isDesktopApp.mockImplementation(() => false);

        const wrapper = shallow(
            <SidebarChannelButtonOrLink
                channelType={Constants.DM_CHANNEL}
                channelId={'test-channel-id'}
                channelStatus={'test'}
                link={'test-link'}
                rowClass={'test-class'}
                displayName={'test-channel-name'}
                handleClose={jest.fn()}
                badge={true}
                membersCount={3}
                unreadMentions={6}
                teammateId={'test-teammate-id'}
                teammateDeletedAt={1}
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
                channelStatus={'test'}
                link={'test-link'}
                rowClass={'test-class'}
                displayName={'test-channel-name'}
                handleClose={jest.fn()}
                membersCount={3}
                unreadMentions={6}
                teammateId={'test-teammate-id'}
                teammateDeletedAt={1}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should trackEvent and mark but not add history entry on non-desktop on click', () => {
        const userAgentMock = require.requireMock('utils/user_agent');
        userAgentMock.isDesktopApp.mockImplementation(() => false);

        const wrapper = shallow(
            <SidebarChannelButtonOrLink
                channelType={Constants.DM_CHANNEL}
                channelId={'test-channel-id'}
                channelStatus={'test'}
                link={'test-link'}
                rowClass={'test-class'}
                displayName={'test-channel-name'}
                handleClose={jest.fn()}
                membersCount={3}
                unreadMentions={6}
                teammateId={'test-teammate-id'}
                teammateDeletedAt={1}
            />
        );
        const reactRouterMock = require.requireMock('react-router');
        const diagnosticsActionsMock = require.requireMock('actions/diagnostics_actions.jsx');
        expect(diagnosticsActionsMock.trackEvent).not.toBeCalled();
        expect(diagnosticsActionsMock.mark).not.toBeCalled();
        expect(reactRouterMock.browserHistory.push).not.toBeCalled();
        wrapper.find('Link').simulate('click');
        expect(diagnosticsActionsMock.trackEvent).toBeCalledWith('ui', 'ui_channel_selected');
        expect(diagnosticsActionsMock.mark).toBeCalledWith('SidebarChannelLink#click');
        expect(reactRouterMock.browserHistory.push).not.toBeCalled();
    });
});
