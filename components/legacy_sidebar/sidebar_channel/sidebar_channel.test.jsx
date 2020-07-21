// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';
import {Constants} from 'utils/constants';

import SidebarChannel from './sidebar_channel';

/* eslint-disable global-require */

jest.mock('actions/telemetry_actions.jsx', () => {
    return {
        trackEvent: jest.fn(),
    };
});

jest.mock('utils/browser_history', () => {
    const original = jest.requireActual('utils/browser_history');
    return {
        ...original,
        browserHistory: {
            push: jest.fn(),
        },
    };
});

jest.mock('utils/utils.jsx', () => {
    const original = jest.requireActual('utils/utils.jsx');
    return {
        ...original,
        isMobile: jest.fn(() => true),
    };
});

jest.mock('actions/global_actions.jsx', () => {
    const original = jest.requireActual('actions/global_actions.jsx');
    return {
        ...original,
        showLeavePrivateChannelModal: jest.fn(),
    };
});

describe('component/legacy_sidebar/sidebar_channel/SidebarChannel', () => {
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
        hasDraft: false,
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
        showUnreadForMsgs: true,
        shouldHideChannel: false,
        redirectChannel: 'test-default-channel',
        actions: {
            savePreferences: jest.fn(),
            leaveChannel: jest.fn(),
            openLhs: jest.fn(),
            leaveDirectChannel: jest.fn(),
        },
        channelIsArchived: false,
    };

    test('should match snapshot, on channel show', () => {
        const props = defaultProps;
        const wrapper = shallowWithIntl(
            <SidebarChannel {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
        expect(props.actions.openLhs).not.toBeCalled();
    });

    test('should match snapshot, on channel hide', () => {
        const props = {...defaultProps, shouldHideChannel: true};
        const wrapper = shallowWithIntl(
            <SidebarChannel {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
        expect(props.actions.openLhs).not.toBeCalled();
    });

    test('should match snapshot, on fake channel show', () => {
        const channel = {
            display_name: 'Channel display name',
            name: 'channel-name',
            type: Constants.DM_CHANNEL,
            id: 'test-channel-id',
            status: 'test',
            fake: true,
        };
        const props = {
            ...defaultProps,
            channelDisplayName: channel.display_name,
            channelName: channel.name,
            channelType: channel.type,
            channelId: channel.id,
            channelStatus: channel.status,
            channelFake: true,
            channelStringified: JSON.stringify(channel),
        };

        const wrapper = shallowWithIntl(<SidebarChannel {...props}/>);
        expect(wrapper).toMatchSnapshot();
        expect(props.actions.openLhs).not.toBeCalled();
    });

    test('should match snapshot, on active channel show', () => {
        const props = {
            ...defaultProps,
            active: true,
        };
        const wrapper = shallowWithIntl(<SidebarChannel {...props}/>);
        expect(wrapper).toMatchSnapshot();
        expect(props.actions.openLhs).not.toBeCalled();
    });

    test('should match snapshot, on myself channel show', () => {
        const props = {
            ...defaultProps,
            currentUserId: 'myself',
            channelTeammateId: 'myself',
        };
        const wrapper = shallowWithIntl(<SidebarChannel {...props}/>);
        expect(wrapper).toMatchSnapshot();
        expect(props.actions.openLhs).not.toBeCalled();
    });

    test('should match snapshot, on channel with draft', () => {
        const props = {
            ...defaultProps,
            currentUserId: 'myself',
            channelTeammateId: 'myself',
            hasDraft: true,
        };
        const wrapper = shallowWithIntl(<SidebarChannel {...props}/>);
        expect(wrapper).toMatchSnapshot();
        expect(props.actions.openLhs).not.toBeCalled();
    });

    test('should match snapshot, on channel show with tutorial tip', () => {
        const props = {
            ...defaultProps,
            showTutorialTip: true,
            channelId: 'test',
            channelName: Constants.DEFAULT_CHANNEL,
            channelType: Constants.OPEN_CHANNEL,
            channelDisplayName: 'Town Square',
        };
        const wrapper = shallowWithIntl(<SidebarChannel {...props}/>);
        expect(wrapper).toMatchSnapshot();
        expect(props.actions.openLhs).not.toBeCalled();
    });

    test('should match snapshot, on channel show with unread mentions (must have mentions badge)', () => {
        const props = {
            ...defaultProps,
            membership: {mention_count: 3},
            unreadMentions: 4,
        };
        const wrapper = shallowWithIntl(<SidebarChannel {...props}/>);
        expect(wrapper).toMatchSnapshot();
        expect(props.actions.openLhs).not.toBeCalled();
    });

    test('should match snapshot, on channel show without unread mentions (must have no badge)', () => {
        const props = {
            ...defaultProps,
            membership: {mention_count: 3},
            unreadMentions: 0,
        };
        const wrapper = shallowWithIntl(<SidebarChannel {...props}/>);
        expect(wrapper).toMatchSnapshot();
        expect(props.actions.openLhs).not.toBeCalled();
    });

    test('should match snapshot, on public channel show', () => {
        const props = {
            ...defaultProps,
            channelDisplayName: 'Channel display name',
            channelName: 'channel-name',
            channelType: Constants.OPEN_CHANNEL,
            channelId: 'test-channel-id',
            channelStatus: 'test',
            channelFake: false,
        };
        const wrapper = shallowWithIntl(<SidebarChannel {...props}/>);
        expect(wrapper).toMatchSnapshot();
        expect(props.actions.openLhs).not.toBeCalled();
    });

    test('should match snapshot, on private channel show', () => {
        const props = {
            ...defaultProps,
            channelDisplayName: 'Channel display name',
            channelName: 'channel-name',
            channelType: Constants.PRIVATE_CHANNEL,
            channelId: 'test-channel-id',
            channelStatus: 'test',
            channelFake: false,
        };
        const wrapper = shallowWithIntl(<SidebarChannel {...props}/>);
        expect(wrapper).toMatchSnapshot();
        expect(props.actions.openLhs).not.toBeCalled();
    });

    test('should match snapshot, on group channel show', () => {
        const props = {
            ...defaultProps,
            channelDisplayName: 'Channel display name',
            channelName: 'channel-name',
            channelType: Constants.PRIVATE_CHANNEL,
            channelId: 'test-channel-id',
            channelStatus: 'test',
            channelFake: false,
        };
        const wrapper = shallowWithIntl(<SidebarChannel {...props}/>);
        expect(wrapper).toMatchSnapshot();
        expect(props.actions.openLhs).not.toBeCalled();
    });

    test('should match snapshot, on default channel show', () => {
        const props = {
            ...defaultProps,
            channelDisplayName: 'Channel display name',
            channelName: Constants.DEFAULT_CHANNEL,
            channelType: Constants.PRIVATE_CHANNEL,
            channelId: 'test-channel-id',
            channelStatus: 'test',
            channelFake: false,
        };
        const wrapper = shallowWithIntl(<SidebarChannel {...props}/>);
        expect(wrapper).toMatchSnapshot();
        expect(props.actions.openLhs).not.toBeCalled();
    });

    test('should match snapshot, on public channel show with enable X to close', () => {
        const props = {
            ...defaultProps,
            config: {
                EnableXToLeaveChannelsFromLHS: 'true',
            },
            channelDisplayName: 'Channel display name',
            channelName: 'channel-name',
            channelType: Constants.OPEN_CHANNEL,
            channelId: 'test-channel-id',
            channelStatus: 'test',
            channelFake: false,
        };
        const wrapper = shallowWithIntl(<SidebarChannel {...props}/>);
        expect(wrapper).toMatchSnapshot();
        expect(props.actions.openLhs).not.toBeCalled();
    });

    test('should match snapshot, on private channel show with enable X to close', () => {
        const props = {
            ...defaultProps,
            config: {
                EnableXToLeaveChannelsFromLHS: 'true',
            },
            channelDisplayName: 'Channel display name',
            channelName: 'channel-name',
            channelType: Constants.PRIVATE_CHANNEL,
            channelId: 'test-channel-id',
            channelStatus: 'test',
            channelFake: false,
        };
        const wrapper = shallowWithIntl(<SidebarChannel {...props}/>);
        expect(wrapper).toMatchSnapshot();
        expect(props.actions.openLhs).not.toBeCalled();
    });

    test('should match snapshot, on group channel show with enable X to close', () => {
        const props = {
            ...defaultProps,
            config: {
                EnableXToLeaveChannelsFromLHS: 'true',
            },
            channelDisplayName: 'Channel display name',
            channelName: 'channel-name',
            channelType: Constants.PRIVATE_CHANNEL,
            channelId: 'test-channel-id',
            channelStatus: 'test',
            channelFake: false,
        };
        const wrapper = shallowWithIntl(<SidebarChannel {...props}/>);
        expect(wrapper).toMatchSnapshot();
        expect(props.actions.openLhs).not.toBeCalled();
    });

    test('should match snapshot, on default channel show with enable X to close', () => {
        const props = {
            ...defaultProps,
            config: {
                EnableXToLeaveChannelsFromLHS: 'true',
            },
            channelDisplayName: 'Channel display name',
            channelName: Constants.DEFAULT_CHANNEL,
            channelType: Constants.OPEN_CHANNEL,
            channelId: 'test-channel-id',
            channelStatus: 'test',
            channelFake: false,
        };
        const wrapper = shallowWithIntl(<SidebarChannel {...props}/>);
        expect(wrapper).toMatchSnapshot();
        expect(props.actions.openLhs).not.toBeCalled();
    });

    test('should leave the direct channel', () => {
        const savePreferences = jest.fn(() => Promise.resolve());
        const trackEvent = require('actions/telemetry_actions.jsx').trackEvent;

        const props = {
            ...defaultProps,
            channelType: Constants.DM_CHANNEL,
            channelId: 'test-channel-id',
            actions: {
                ...defaultProps.actions,
                savePreferences,
            },
        };

        const wrapper = shallowWithIntl(<SidebarChannel {...props}/>);
        wrapper.instance().handleLeaveDirectChannel();
        expect(savePreferences).toBeCalledWith('user-id', [{user_id: 'user-id', category: Constants.Preferences.CATEGORY_DIRECT_CHANNEL_SHOW, name: 'teammate-id', value: 'false'}]);
        expect(trackEvent).toBeCalledWith('ui', 'ui_direct_channel_x_button_clicked');
        expect(props.actions.openLhs).not.toBeCalled();
    });

    test('should leave the group channel', () => {
        const savePreferences = jest.fn(() => Promise.resolve());
        const trackEvent = require('actions/telemetry_actions.jsx').trackEvent;
        const props = {
            ...defaultProps,
            channelType: Constants.GM_CHANNEL,
            channelId: 'test-channel-id',
            actions: {
                ...defaultProps.actions,
                savePreferences,
                leaveChannel: jest.fn(),
            },
        };

        const wrapper = shallowWithIntl(<SidebarChannel {...props}/>);
        wrapper.instance().handleLeaveDirectChannel();
        expect(savePreferences).toBeCalledWith('user-id', [{user_id: 'user-id', category: Constants.Preferences.CATEGORY_GROUP_CHANNEL_SHOW, name: 'test-channel-id', value: 'false'}]);
        expect(trackEvent).toBeCalledWith('ui', 'ui_direct_channel_x_button_clicked');
        expect(props.actions.openLhs).not.toBeCalled();
    });

    test('should leave the active channel', () => {
        const savePreferences = jest.fn(() => Promise.resolve());
        const trackEvent = require('actions/telemetry_actions.jsx').trackEvent;
        const browserHistory = require('utils/browser_history').browserHistory;
        const props = {
            ...defaultProps,
            channelType: Constants.GM_CHANNEL,
            channelId: 'test-channel-id',
            actions: {
                ...defaultProps.actions,
                savePreferences,
                leaveChannel: jest.fn(),
            },
            active: true,
        };

        const wrapper = shallowWithIntl(<SidebarChannel {...props}/>);
        wrapper.instance().handleLeaveDirectChannel();
        expect(savePreferences).toBeCalledWith('user-id', [{user_id: 'user-id', category: Constants.Preferences.CATEGORY_GROUP_CHANNEL_SHOW, name: 'test-channel-id', value: 'false'}]);
        expect(trackEvent).toBeCalledWith('ui', 'ui_direct_channel_x_button_clicked');
        expect(browserHistory.push).toBeCalledWith('/current-team/channels/test-default-channel');
        expect(props.actions.openLhs).not.toBeCalled();
    });

    test('do not leave the channel if it is already leaving', () => {
        const savePreferences = jest.fn(() => Promise.resolve());
        const props = {
            ...defaultProps,
            channelType: Constants.GM_CHANNEL,
            channelId: 'test-channel-id',
            actions: {
                ...defaultProps.actions,
                savePreferences,
            },
            active: true,
        };

        const wrapper = shallowWithIntl(<SidebarChannel {...props}/>);
        const instance = wrapper.instance();
        instance.isLeaving = true;
        instance.handleLeaveDirectChannel();
        expect(savePreferences).not.toBeCalled();
        expect(props.actions.openLhs).not.toBeCalled();
    });

    test('should leave the public channel', () => {
        const leaveChannel = jest.fn();
        const trackEvent = require('actions/telemetry_actions.jsx').trackEvent;
        const props = {
            ...defaultProps,
            channelType: Constants.OPEN_CHANNEL,
            channelId: 'test-channel-id',
            actions: {
                ...defaultProps.actions,
                leaveChannel,
            },
        };

        const wrapper = shallowWithIntl(<SidebarChannel {...props}/>);
        wrapper.instance().handleLeavePublicChannel();
        expect(leaveChannel).toBeCalledWith('test-channel-id');
        expect(trackEvent).toBeCalledWith('ui', 'ui_public_channel_x_button_clicked');
        expect(props.actions.openLhs).not.toBeCalled();
    });

    test('should leave the private channel', () => {
        const trackEvent = require('actions/telemetry_actions.jsx').trackEvent;
        const showLeavePrivateChannelModal = require('actions/global_actions.jsx').showLeavePrivateChannelModal;
        const props = {
            ...defaultProps,
            channelId: 'test-channel-id',
            channelDisplayName: 'Channel display name',
        };

        const wrapper = shallowWithIntl(<SidebarChannel {...props}/>);
        wrapper.instance().handleLeavePrivateChannel();
        expect(showLeavePrivateChannelModal).toBeCalledWith({id: 'test-channel-id', display_name: 'Channel display name'});
        expect(trackEvent).toBeCalledWith('ui', 'ui_private_channel_x_button_clicked');
        expect(props.actions.openLhs).not.toBeCalled();
    });
});
