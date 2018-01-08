// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Constants} from 'utils/constants.jsx';

import SidebarChannel from 'components/sidebar/sidebar_channel/sidebar_channel.jsx';

jest.mock('actions/diagnostics_actions.jsx', () => {
    return {
        trackEvent: jest.fn()
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

jest.mock('utils/utils.jsx', () => {
    const original = require.requireActual('utils/utils.jsx');
    return {
        ...original,
        isMobile: jest.fn(() => true)
    };
});

jest.mock('actions/global_actions.jsx', () => {
    const original = require.requireActual('actions/global_actions.jsx');
    return {
        ...original,
        showLeavePrivateChannelModal: jest.fn()
    };
});

describe('component/sidebar/sidebar_channel/SidebarChannel', () => {
    const defaultProps = {
        config: {},
        channelDisplayName: 'Channel display name',
        channelName: 'channel-name',
        channelType: Constants.DM_CHANNEL,
        channelId: 'test-channel-id',
        channelStatus: 'test',
        channelFake: false,
        channelTeammateId: 'teammate-id',
        channelTeammateDeletedAt: 1,
        handleClose: jest.fn,
        unreadMsgs: 0,
        unreadMentions: 0,
        active: false,
        currentTeamName: 'current-team',
        currentUserId: 'user-id',
        showTutorialTip: false,
        townSquareDisplayName: 'Town Square',
        offTopicDisplayName: 'Off-Topic',
        membersCount: 8,
        actions: {
            savePreferences: jest.fn(),
            leaveChannel: jest.fn()
        }
    };

    test('should match snapshot, on channel show', () => {
        const wrapper = shallow(
            <SidebarChannel {...defaultProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on fake channel show', () => {
        const channel = {
            display_name: 'Channel display name',
            name: 'channel-name',
            type: Constants.DM_CHANNEL,
            id: 'test-channel-id',
            status: 'test',
            fake: true
        };
        const wrapper = shallow(
            <SidebarChannel
                {...{
                    ...defaultProps,
                    channelDisplayName: channel.display_name,
                    channelName: channel.name,
                    channelType: channel.type,
                    channelId: channel.id,
                    channelStatus: channel.status,
                    channelFake: true,
                    channelStringified: JSON.stringify(channel)
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on active channel show', () => {
        const wrapper = shallow(
            <SidebarChannel
                {...{
                    ...defaultProps,
                    active: true
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on myself channel show', () => {
        const wrapper = shallow(
            <SidebarChannel
                {...{
                    ...defaultProps,
                    currentUserId: 'myself',
                    channelTeammateId: 'myself'
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on channel show with tutorial tip', () => {
        const wrapper = shallow(
            <SidebarChannel
                {...{
                    ...defaultProps,
                    showTutorialTip: true,
                    channelId: 'test',
                    channelName: Constants.DEFAULT_CHANNEL,
                    channelType: Constants.OPEN_CHANNEL,
                    channelDisplayName: 'Town Square'
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on channel show with unread mentions (must have mentions badge)', () => {
        const wrapper = shallow(
            <SidebarChannel
                {...{
                    ...defaultProps,
                    membership: {mention_count: 3},
                    unreadMentions: 4
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on channel show without unread mentions (must have no badge)', () => {
        const wrapper = shallow(
            <SidebarChannel
                {...{
                    ...defaultProps,
                    membership: {mention_count: 3},
                    unreadMentions: 0
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on public channel show', () => {
        const wrapper = shallow(
            <SidebarChannel
                {...{
                    ...defaultProps,
                    channelDisplayName: 'Channel display name',
                    channelName: 'channel-name',
                    channelType: Constants.OPEN_CHANNEL,
                    channelId: 'test-channel-id',
                    channelStatus: 'test',
                    channelFake: false
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on private channel show', () => {
        const wrapper = shallow(
            <SidebarChannel
                {...{
                    ...defaultProps,
                    channelDisplayName: 'Channel display name',
                    channelName: 'channel-name',
                    channelType: Constants.PRIVATE_CHANNEL,
                    channelId: 'test-channel-id',
                    channelStatus: 'test',
                    channelFake: false
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on group channel show', () => {
        const wrapper = shallow(
            <SidebarChannel
                {...{
                    ...defaultProps,
                    channelDisplayName: 'Channel display name',
                    channelName: 'channel-name',
                    channelType: Constants.PRIVATE_CHANNEL,
                    channelId: 'test-channel-id',
                    channelStatus: 'test',
                    channelFake: false
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on default channel show', () => {
        const wrapper = shallow(
            <SidebarChannel
                {...{
                    ...defaultProps,
                    channelDisplayName: 'Channel display name',
                    channelName: Constants.DEFAULT_CHANNEL,
                    channelType: Constants.PRIVATE_CHANNEL,
                    channelId: 'test-channel-id',
                    channelStatus: 'test',
                    channelFake: false
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on public channel show with enable X to close', () => {
        const wrapper = shallow(
            <SidebarChannel
                {...{
                    ...defaultProps,
                    config: {
                        EnableXToLeaveChannelsFromLHS: 'true'
                    },
                    channelDisplayName: 'Channel display name',
                    channelName: 'channel-name',
                    channelType: Constants.OPEN_CHANNEL,
                    channelId: 'test-channel-id',
                    channelStatus: 'test',
                    channelFake: false
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on private channel show with enable X to close', () => {
        const wrapper = shallow(
            <SidebarChannel
                {...{
                    ...defaultProps,
                    config: {
                        EnableXToLeaveChannelsFromLHS: 'true'
                    },
                    channelDisplayName: 'Channel display name',
                    channelName: 'channel-name',
                    channelType: Constants.PRIVATE_CHANNEL,
                    channelId: 'test-channel-id',
                    channelStatus: 'test',
                    channelFake: false
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on group channel show with enable X to close', () => {
        const wrapper = shallow(
            <SidebarChannel
                {...{
                    ...defaultProps,
                    config: {
                        EnableXToLeaveChannelsFromLHS: 'true'
                    },
                    channelDisplayName: 'Channel display name',
                    channelName: 'channel-name',
                    channelType: Constants.PRIVATE_CHANNEL,
                    channelId: 'test-channel-id',
                    channelStatus: 'test',
                    channelFake: false
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on default channel show with enable X to close', () => {
        const wrapper = shallow(
            <SidebarChannel
                {...{
                    ...defaultProps,
                    config: {
                        EnableXToLeaveChannelsFromLHS: 'true'
                    },
                    channelDisplayName: 'Channel display name',
                    channelName: Constants.DEFAULT_CHANNEL,
                    channelType: Constants.OPEN_CHANNEL,
                    channelId: 'test-channel-id',
                    channelStatus: 'test',
                    channelFake: false
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should leave the direct channel', () => {
        const savePreferences = jest.fn(() => Promise.resolve());
        const trackEvent = require('actions/diagnostics_actions.jsx').trackEvent;

        const wrapper = shallow(
            <SidebarChannel
                {...{
                    ...defaultProps,
                    channelType: Constants.DM_CHANNEL,
                    channelId: 'test-channel-id',
                    actions: {
                        savePreferences,
                        leaveChannel: jest.fn()
                    }
                }}
            />
        );
        wrapper.instance().handleLeaveDirectChannel();
        expect(savePreferences).toBeCalledWith('user-id', [{user_id: 'user-id', category: Constants.Preferences.CATEGORY_DIRECT_CHANNEL_SHOW, name: 'teammate-id', value: 'false'}]);
        expect(trackEvent).toBeCalledWith('ui', 'ui_direct_channel_x_button_clicked');
    });

    test('should leave the group channel', () => {
        const savePreferences = jest.fn(() => Promise.resolve());
        const trackEvent = require('actions/diagnostics_actions.jsx').trackEvent;

        const wrapper = shallow(
            <SidebarChannel
                {...{
                    ...defaultProps,
                    channelType: Constants.GM_CHANNEL,
                    channelId: 'test-channel-id',
                    actions: {
                        savePreferences,
                        leaveChannel: jest.fn()
                    }
                }}
            />
        );
        wrapper.instance().handleLeaveDirectChannel();
        expect(savePreferences).toBeCalledWith('user-id', [{user_id: 'user-id', category: Constants.Preferences.CATEGORY_GROUP_CHANNEL_SHOW, name: 'test-channel-id', value: 'false'}]);
        expect(trackEvent).toBeCalledWith('ui', 'ui_direct_channel_x_button_clicked');
    });

    test('should leave the active channel', () => {
        const savePreferences = jest.fn(() => Promise.resolve());
        const trackEvent = require('actions/diagnostics_actions.jsx').trackEvent;
        const browserHistory = require('react-router').browserHistory;

        const wrapper = shallow(
            <SidebarChannel
                {...{
                    ...defaultProps,
                    channelType: Constants.GM_CHANNEL,
                    channelId: 'test-channel-id',
                    actions: {
                        savePreferences,
                        leaveChannel: jest.fn()
                    },
                    active: true
                }}
            />
        );
        wrapper.instance().handleLeaveDirectChannel();
        expect(savePreferences).toBeCalledWith('user-id', [{user_id: 'user-id', category: Constants.Preferences.CATEGORY_GROUP_CHANNEL_SHOW, name: 'test-channel-id', value: 'false'}]);
        expect(trackEvent).toBeCalledWith('ui', 'ui_direct_channel_x_button_clicked');
        expect(browserHistory.push).toBeCalledWith('/current-team/channels/town-square');
    });

    test('do not leave the channel if it is already leaving', () => {
        const savePreferences = jest.fn(() => Promise.resolve());

        const wrapper = shallow(
            <SidebarChannel
                {...{
                    ...defaultProps,
                    channelType: Constants.GM_CHANNEL,
                    channelId: 'test-channel-id',
                    actions: {
                        savePreferences,
                        leaveChannel: jest.fn()
                    },
                    active: true
                }}
            />
        );
        const instance = wrapper.instance();
        instance.isLeaving = true;
        instance.handleLeaveDirectChannel();
        expect(savePreferences).not.toBeCalled();
    });

    test('should leave the public channel', () => {
        const leaveChannel = jest.fn();
        const trackEvent = require('actions/diagnostics_actions.jsx').trackEvent;

        const wrapper = shallow(
            <SidebarChannel
                {...{
                    ...defaultProps,
                    channelType: Constants.OPEN_CHANNEL,
                    channelId: 'test-channel-id',
                    actions: {
                        savePreferences: jest.fn(),
                        leaveChannel
                    }
                }}
            />
        );
        wrapper.instance().handleLeavePublicChannel();
        expect(leaveChannel).toBeCalledWith('test-channel-id');
        expect(trackEvent).toBeCalledWith('ui', 'ui_public_channel_x_button_clicked');
    });

    test('should leave the private channel', () => {
        const trackEvent = require('actions/diagnostics_actions.jsx').trackEvent;
        const showLeavePrivateChannelModal = require('actions/global_actions.jsx').showLeavePrivateChannelModal;

        const wrapper = shallow(
            <SidebarChannel
                {...{
                    ...defaultProps,
                    channelId: 'test-channel-id',
                    channelDisplayName: 'Channel display name'
                }}
            />
        );
        wrapper.instance().handleLeavePrivateChannel();
        expect(showLeavePrivateChannelModal).toBeCalledWith({id: 'test-channel-id', display_name: 'Channel display name'});
        expect(trackEvent).toBeCalledWith('ui', 'ui_private_channel_x_button_clicked');
    });
});
