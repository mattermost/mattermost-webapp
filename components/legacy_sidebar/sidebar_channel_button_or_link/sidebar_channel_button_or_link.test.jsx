// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Tooltip} from 'react-bootstrap';

import OverlayTrigger from 'components/overlay_trigger';

import {Constants} from 'utils/constants';

import SidebarChannelButtonOrLink from './sidebar_channel_button_or_link.jsx';

describe('component/legacy_sidebar/sidebar_channel_button_or_link/SidebarChannelButtonOrLink', () => {
    const baseProps = {
        channelType: Constants.DM_CHANNEL,
        channelId: 'test-channel-id',
        channelName: 'test-channel-name',
        channelStatus: 'test',
        link: 'test-link',
        rowClass: 'test-class',
        displayName: 'test-channel-name',
        handleClose: jest.fn(),
        hasDraft: false,
        membersCount: 3,
        showUnreadForMsgs: true,
        unreadMsgs: 2,
        unreadMentions: 6,
        teammateId: 'test-teammate-id',
        teammateDeletedAt: 1,
        channelIsArchived: false,
    };

    test('should match snapshot, on desktop with mentions badge', () => {
        const props = {...baseProps, badge: true};
        const wrapper = shallow(
            <SidebarChannelButtonOrLink {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on desktop with draft', () => {
        const props = {...baseProps, hasDraft: true, badge: false, unreadMentions: 0};
        const wrapper = shallow(
            <SidebarChannelButtonOrLink {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on desktop without badge', () => {
        const wrapper = shallow(
            <SidebarChannelButtonOrLink {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should trackEvent, mark and add history entry on desktop on click', () => {
        const browserHistoryMock = jest.requireMock('utils/browser_history');
        const telemetryActionsMock = jest.requireMock('actions/telemetry_actions.jsx');
        expect(telemetryActionsMock.trackEvent).not.toBeCalled();
        expect(telemetryActionsMock.mark).not.toBeCalled();
        expect(browserHistoryMock.browserHistory.push).not.toBeCalled();
    });

    test('should match snapshot, on non-desktop with mentions badge', () => {
        const userAgentMock = jest.requireMock('utils/user_agent');
        userAgentMock.isDesktopApp.mockImplementation(() => false);

        const props = {...baseProps, badge: true};
        const wrapper = shallow(
            <SidebarChannelButtonOrLink {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on non-desktop without badge', () => {
        const userAgentMock = jest.requireMock('utils/user_agent');
        userAgentMock.isDesktopApp.mockImplementation(() => false);

        const wrapper = shallow(
            <SidebarChannelButtonOrLink {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should trackEvent and mark but not add history entry on non-desktop on click', () => {
        const userAgentMock = jest.requireMock('utils/user_agent');
        userAgentMock.isDesktopApp.mockImplementation(() => false);

        const browserHistoryMock = jest.requireMock('utils/browser_history');
        const telemetryActionsMock = jest.requireMock('actions/telemetry_actions.jsx');
        expect(telemetryActionsMock.trackEvent).not.toBeCalled();
        expect(telemetryActionsMock.mark).not.toBeCalled();
        expect(browserHistoryMock.browserHistory.push).not.toBeCalled();
    });

    describe('should properly handle state to show tooltip', () => {
        for (const testCase of [
            {
                name: 'Direct Message',
                channelType: Constants.DM_CHANNEL,
            },
            {
                name: 'Group Message',
                channelType: Constants.GM_CHANNEL,
            },
            {
                name: 'Public Channel',
                channelType: Constants.OPEN_CHANNEL,
            },
            {
                name: 'Private Channel',
                channelType: Constants.PRIVATE_CHANNEL,
            },
        ]) {
            test(testCase.name, () => {
                const props = {
                    ...baseProps,
                    channelType: testCase.channelType,
                };

                const wrapper = shallow(
                    <SidebarChannelButtonOrLink {...props}/>,
                );

                expect(wrapper.find(OverlayTrigger)).toHaveLength(0);

                wrapper.instance().setState({showTooltip: true});

                expect(wrapper.find(OverlayTrigger)).toHaveLength(1);
                const overlayWrapper = wrapper.find(OverlayTrigger).first();
                expect(overlayWrapper.prop('overlay').type).toEqual(Tooltip);
                expect(overlayWrapper.prop('overlay').props.children).toEqual(baseProps.displayName);
            });
        }
    });
});
