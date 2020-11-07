// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {shallow} from 'enzyme';

import {IgnoreChannelMentions, NotificationLevels, NotificationSections} from 'utils/constants';

import ChannelNotificationsModal from 'components/channel_notifications_modal/channel_notifications_modal.jsx';

describe('components/channel_notifications_modal/ChannelNotificationsModal', () => {
    const baseProps = {
        show: true,
        onHide: () => {}, //eslint-disable-line no-empty-function
        channel: {id: 'channel_id', display_name: 'channel_display_name'},
        channelMember: {
            notify_props: {
                desktop: NotificationLevels.ALL,
                mark_unread: NotificationLevels.ALL,
                push: NotificationLevels.DEFAULT,
                ignore_channel_mentions: IgnoreChannelMentions.DEFAULT,
            },
        },
        currentUser: {
            id: 'current_user_id',
            notify_props: {
                desktop: NotificationLevels.ALL,
            },
        },
        sendPushNotifications: true,
        actions: {
            updateChannelNotifyProps: () => {}, //eslint-disable-line no-empty-function
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <ChannelNotificationsModal {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should provide default notify props when missing', () => {
        const wrapper = shallow(
            <ChannelNotificationsModal
                {...baseProps}
                channelMember={{notify_props: {}}}
            />,
        );

        expect(wrapper.state('desktopNotifyLevel')).toEqual(NotificationLevels.DEFAULT);
        expect(wrapper.state('markUnreadNotifyLevel')).toEqual(NotificationLevels.ALL);
        expect(wrapper.state('pushNotifyLevel')).toEqual(NotificationLevels.DEFAULT);
        expect(wrapper.state('ignoreChannelMentions')).toEqual(IgnoreChannelMentions.OFF);
    });

    test('should provide correct default when currentUser channel notify props is true', () => {
        const currentUser = {
            id: 'current_user_id',
            notify_props: {
                desktop: NotificationLevels.ALL,
                channel: 'true',
            },
        };
        const props = {...baseProps, currentUser};
        const wrapper = shallow(
            <ChannelNotificationsModal {...props}/>,
        );

        expect(wrapper.state('ignoreChannelMentions')).toEqual(IgnoreChannelMentions.OFF);
    });

    test('should provide correct default when currentUser channel notify props is false', () => {
        const currentUser = {
            id: 'current_user_id',
            notify_props: {
                desktop: NotificationLevels.ALL,
                channel: 'false',
            },
        };
        const props = {...baseProps, currentUser};
        const wrapper = shallow(
            <ChannelNotificationsModal {...props}/>,
        );

        expect(wrapper.state('ignoreChannelMentions')).toEqual(IgnoreChannelMentions.ON);
    });

    test('should provide correct value for ignoreChannelMentions when channelMember channel-wide mentions are off and false on the currentUser', () => {
        const currentUser = {
            id: 'current_user_id',
            notify_props: {
                desktop: NotificationLevels.ALL,
                channel: 'false',
            },
        };
        const channelMember = {
            notify_props: {
                ignore_channel_mentions: IgnoreChannelMentions.OFF,
            },
        };
        const props = {...baseProps, channelMember, currentUser};
        const wrapper = shallow(
            <ChannelNotificationsModal {...props}/>,
        );

        expect(wrapper.state('ignoreChannelMentions')).toEqual(IgnoreChannelMentions.OFF);
    });

    test('should provide correct value for ignoreChannelMentions when channelMember channel-wide mentions are on but false on currentUser', () => {
        const currentUser = {
            id: 'current_user_id',
            notify_props: {
                desktop: NotificationLevels.ALL,
                channel: 'true',
            },
        };
        const channelMember = {
            notify_props: {
                ignore_channel_mentions: IgnoreChannelMentions.ON,
            },
        };
        const props = {...baseProps, channelMember, currentUser};
        const wrapper = shallow(
            <ChannelNotificationsModal {...props}/>,
        );

        expect(wrapper.state('ignoreChannelMentions')).toEqual(IgnoreChannelMentions.ON);
    });

    test('should provide correct value for ignoreChannelMentions when channel is muted', () => {
        const currentUser = {
            id: 'current_user_id',
            notify_props: {
                desktop: NotificationLevels.ALL,
                channel: 'true',
            },
        };
        const channelMember = {
            notify_props: {
                mark_unread: NotificationLevels.MENTION,
                ignore_channel_mentions: IgnoreChannelMentions.DEFAULT,
            },
        };
        const props = {...baseProps, channelMember, currentUser};
        const wrapper = shallow(
            <ChannelNotificationsModal {...props}/>,
        );

        expect(wrapper.state('ignoreChannelMentions')).toEqual(IgnoreChannelMentions.ON);
    });

    test('should call onHide and match state on handleOnHide', () => {
        const onHide = jest.fn();
        const props = {...baseProps, onHide};
        const wrapper = shallow(
            <ChannelNotificationsModal {...props}/>,
        );

        wrapper.setState({activeSection: NotificationSections.DESKTOP, desktopNotifyLevel: NotificationLevels.NONE});
        wrapper.instance().handleExit();
        expect(onHide).toHaveBeenCalledTimes(1);
        expect(wrapper.state('activeSection')).toEqual(NotificationSections.NONE);
        expect(wrapper.state('desktopNotifyLevel')).toEqual(NotificationLevels.ALL);

        wrapper.setState({activeSection: NotificationSections.MARK_UNREAD, markUnreadNotifyLevel: NotificationLevels.NONE});
        wrapper.instance().handleExit();
        expect(onHide).toHaveBeenCalledTimes(2);
        expect(wrapper.state('activeSection')).toEqual(NotificationSections.NONE);
        expect(wrapper.state('markUnreadNotifyLevel')).toEqual(NotificationLevels.ALL);

        wrapper.setState({activeSection: NotificationSections.PUSH, pushNotifyLevel: NotificationLevels.NONE});
        wrapper.instance().handleExit();
        expect(onHide).toHaveBeenCalledTimes(3);
        expect(wrapper.state('activeSection')).toEqual(NotificationSections.NONE);
        expect(wrapper.state('pushNotifyLevel')).toEqual(NotificationLevels.DEFAULT);
    });

    test('should match state on updateSection', () => {
        const wrapper = shallow(
            <ChannelNotificationsModal {...baseProps}/>,
        );

        wrapper.setState({activeSection: NotificationSections.NONE});
        wrapper.instance().updateSection(NotificationSections.DESKTOP);
        expect(wrapper.state('activeSection')).toEqual(NotificationSections.DESKTOP);
    });

    test('should reset state when collapsing a section', () => {
        const wrapper = shallow(
            <ChannelNotificationsModal {...baseProps}/>,
        );

        wrapper.instance().updateSection(NotificationSections.DESKTOP);
        wrapper.instance().handleUpdateDesktopNotifyLevel(NotificationLevels.NONE);

        expect(wrapper.state('desktopNotifyLevel')).toEqual(NotificationLevels.NONE);

        wrapper.instance().updateSection('');

        expect(wrapper.state('desktopNotifyLevel')).toEqual(baseProps.channelMember.notify_props.desktop);
    });

    test('should match state on handleSubmitDesktopNotifyLevel', () => {
        const wrapper = shallow(
            <ChannelNotificationsModal {...baseProps}/>,
        );

        const instance = wrapper.instance();
        instance.handleUpdateChannelNotifyProps = jest.fn();
        instance.updateSection = jest.fn();

        wrapper.setState({desktopNotifyLevel: NotificationLevels.DEFAULT});
        instance.handleSubmitDesktopNotifyLevel();
        expect(instance.handleUpdateChannelNotifyProps).toHaveBeenCalledTimes(1);

        wrapper.setState({desktopNotifyLevel: NotificationLevels.ALL});
        instance.handleSubmitDesktopNotifyLevel();
        expect(instance.updateSection).toHaveBeenCalledTimes(1);
        expect(instance.updateSection).toBeCalledWith('');
    });

    test('should match state on handleUpdateDesktopNotifyLevel', () => {
        const wrapper = shallow(
            <ChannelNotificationsModal {...baseProps}/>,
        );

        wrapper.setState({desktopNotifyLevel: NotificationLevels.ALL});
        wrapper.instance().handleUpdateDesktopNotifyLevel(NotificationLevels.MENTION);
        expect(wrapper.state('desktopNotifyLevel')).toEqual(NotificationLevels.MENTION);
    });

    test('should match state on handleSubmitMarkUnreadLevel', () => {
        const channelMember = {
            notify_props: {
                desktop: NotificationLevels.NONE,
                mark_unread: NotificationLevels.ALL,
            },
        };
        const props = {...baseProps, channelMember};
        const wrapper = shallow(
            <ChannelNotificationsModal {...props}/>,
        );

        const instance = wrapper.instance();
        instance.handleUpdateChannelNotifyProps = jest.fn();
        instance.updateSection = jest.fn();

        wrapper.setState({markUnreadNotifyLevel: NotificationLevels.DEFAULT});
        instance.handleSubmitMarkUnreadLevel();
        expect(instance.handleUpdateChannelNotifyProps).toHaveBeenCalledTimes(1);

        wrapper.setState({markUnreadNotifyLevel: NotificationLevels.ALL});
        instance.handleSubmitMarkUnreadLevel();
        expect(instance.updateSection).toHaveBeenCalledTimes(1);
        expect(instance.updateSection).toBeCalledWith('');
    });

    test('should match state on handleUpdateMarkUnreadLevel', () => {
        const channelMember = {
            notify_props: {
                desktop: NotificationLevels.NONE,
                mark_unread: NotificationLevels.ALL,
            },
        };
        const props = {...baseProps, channelMember};
        const wrapper = shallow(
            <ChannelNotificationsModal {...props}/>,
        );

        wrapper.setState({markUnreadNotifyLevel: NotificationLevels.ALL});
        wrapper.instance().handleUpdateMarkUnreadLevel(NotificationLevels.MENTION);
        expect(wrapper.state('markUnreadNotifyLevel')).toEqual(NotificationLevels.MENTION);
    });

    test('should match state on handleSubmitPushNotificationLevel', () => {
        const channelMember = {
            notify_props: {
                desktop: NotificationLevels.NONE,
                mark_unread: NotificationLevels.NONE,
                push: NotificationLevels.ALL,
            },
        };
        const props = {...baseProps, channelMember};
        const wrapper = shallow(
            <ChannelNotificationsModal {...props}/>,
        );

        const instance = wrapper.instance();
        instance.handleUpdateChannelNotifyProps = jest.fn();
        instance.updateSection = jest.fn();

        wrapper.setState({pushNotifyLevel: NotificationLevels.DEFAULT});
        instance.handleSubmitPushNotificationLevel();
        expect(instance.handleUpdateChannelNotifyProps).toHaveBeenCalledTimes(1);

        wrapper.setState({pushNotifyLevel: NotificationLevels.ALL});
        instance.handleSubmitPushNotificationLevel();
        expect(instance.updateSection).toHaveBeenCalledTimes(1);
        expect(instance.updateSection).toBeCalledWith('');
    });

    test('should match state on handleUpdatePushNotificationLevel', () => {
        const channelMember = {
            notify_props: {
                desktop: NotificationLevels.NONE,
                mark_unread: NotificationLevels.NONE,
                push: NotificationLevels.ALL,
            },
        };
        const props = {...baseProps, channelMember};
        const wrapper = shallow(
            <ChannelNotificationsModal {...props}/>,
        );

        wrapper.setState({pushNotifyLevel: NotificationLevels.ALL});
        wrapper.instance().handleUpdatePushNotificationLevel(NotificationLevels.MENTION);
        expect(wrapper.state('pushNotifyLevel')).toEqual(NotificationLevels.MENTION);
    });

    test('should match state on resetStateFromNotifyProps', () => {
        const channelMemberNotifyProps = {
            desktop: NotificationLevels.NONE,
            mark_unread: NotificationLevels.NONE,
            push: NotificationLevels.ALL,
        };
        const currentUserNotifyProps = {
            channel: 'false',
        };
        const wrapper = shallow(
            <ChannelNotificationsModal {...baseProps}/>,
        );

        wrapper.instance().resetStateFromNotifyProps(channelMemberNotifyProps, currentUserNotifyProps);
        expect(wrapper.state('desktopNotifyLevel')).toEqual(NotificationLevels.NONE);
        expect(wrapper.state('markUnreadNotifyLevel')).toEqual(NotificationLevels.NONE);
        expect(wrapper.state('pushNotifyLevel')).toEqual(NotificationLevels.ALL);
        expect(wrapper.state('ignoreChannelMentions')).toEqual(IgnoreChannelMentions.ON);

        wrapper.instance().resetStateFromNotifyProps({...channelMemberNotifyProps, desktop: NotificationLevels.ALL}, currentUserNotifyProps);
        expect(wrapper.state('desktopNotifyLevel')).toEqual(NotificationLevels.ALL);

        wrapper.instance().resetStateFromNotifyProps({...channelMemberNotifyProps, mark_unread: NotificationLevels.ALL}, currentUserNotifyProps);
        expect(wrapper.state('markUnreadNotifyLevel')).toEqual(NotificationLevels.ALL);

        wrapper.instance().resetStateFromNotifyProps({...channelMemberNotifyProps, push: NotificationLevels.NONE}, currentUserNotifyProps);
        expect(wrapper.state('pushNotifyLevel')).toEqual(NotificationLevels.NONE);
    });
});
