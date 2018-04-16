import React from 'react';
import {shallow} from 'enzyme';

import {NotificationLevels, NotificationSections} from 'utils/constants.jsx';

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
            <ChannelNotificationsModal {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should call onHide and match state on handleOnHide', () => {
        const onHide = jest.fn();
        const props = {...baseProps, onHide};
        const wrapper = shallow(
            <ChannelNotificationsModal {...props}/>
        );

        wrapper.setState({activeSection: NotificationSections.DESKTOP});
        wrapper.instance().handleOnHide();
        expect(onHide).toHaveBeenCalledTimes(1);
        expect(wrapper.state('activeSection')).toEqual(NotificationSections.NONE);
    });

    test('should match state on updateSection', () => {
        const wrapper = shallow(
            <ChannelNotificationsModal {...baseProps}/>
        );

        wrapper.setState({activeSection: NotificationSections.NONE});
        wrapper.instance().updateSection(NotificationSections.DESKTOP);
        expect(wrapper.state('activeSection')).toEqual(NotificationSections.DESKTOP);
    });

    test('should match state on handleSubmitDesktopNotifyLevel', () => {
        const wrapper = shallow(
            <ChannelNotificationsModal {...baseProps}/>
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
            <ChannelNotificationsModal {...baseProps}/>
        );

        wrapper.setState({desktopNotifyLevel: NotificationLevels.ALL});
        wrapper.instance().handleUpdateDesktopNotifyLevel(NotificationLevels.MENTION);
        expect(wrapper.state('desktopNotifyLevel')).toEqual(NotificationLevels.MENTION);
    });

    test('should match state on handleUpdateDesktopSection', () => {
        const wrapper = shallow(
            <ChannelNotificationsModal {...baseProps}/>
        );

        const instance = wrapper.instance();
        instance.updateSection = jest.fn();

        wrapper.setState({desktopNotifyLevel: NotificationLevels.NONE});
        instance.handleUpdateDesktopSection();
        expect(wrapper.state('desktopNotifyLevel')).toEqual(NotificationLevels.ALL);

        expect(instance.updateSection).toHaveBeenCalledTimes(1);
        expect(instance.updateSection).toBeCalledWith(NotificationSections.NONE);

        instance.handleUpdateDesktopSection(NotificationSections.DESKTOP);
        expect(instance.updateSection).toHaveBeenCalledTimes(2);
        expect(instance.updateSection).toBeCalledWith(NotificationSections.DESKTOP);
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
            <ChannelNotificationsModal {...props}/>
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
            <ChannelNotificationsModal {...props}/>
        );

        wrapper.setState({markUnreadNotifyLevel: NotificationLevels.ALL});
        wrapper.instance().handleUpdateMarkUnreadLevel(NotificationLevels.MENTION);
        expect(wrapper.state('markUnreadNotifyLevel')).toEqual(NotificationLevels.MENTION);
    });

    test('should match state on handleUpdateMarkUnreadSection', () => {
        const channelMember = {
            notify_props: {
                desktop: NotificationLevels.NONE,
                mark_unread: NotificationLevels.ALL,
            },
        };
        const props = {...baseProps, channelMember};
        const wrapper = shallow(
            <ChannelNotificationsModal {...props}/>
        );

        const instance = wrapper.instance();
        instance.updateSection = jest.fn();

        wrapper.setState({markUnreadNotifyLevel: NotificationLevels.NONE});
        instance.handleUpdateMarkUnreadSection();
        expect(wrapper.state('markUnreadNotifyLevel')).toEqual(NotificationLevels.ALL);

        expect(instance.updateSection).toHaveBeenCalledTimes(1);
        expect(instance.updateSection).toBeCalledWith(NotificationSections.NONE);

        instance.handleUpdateMarkUnreadSection(NotificationSections.MARK_UNREAD);
        expect(instance.updateSection).toHaveBeenCalledTimes(2);
        expect(instance.updateSection).toBeCalledWith(NotificationSections.MARK_UNREAD);
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
            <ChannelNotificationsModal {...props}/>
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
            <ChannelNotificationsModal {...props}/>
        );

        wrapper.setState({pushNotifyLevel: NotificationLevels.ALL});
        wrapper.instance().handleUpdatePushNotificationLevel(NotificationLevels.MENTION);
        expect(wrapper.state('pushNotifyLevel')).toEqual(NotificationLevels.MENTION);
    });

    test('should match state on handleUpdatePushSection', () => {
        const channelMember = {
            notify_props: {
                desktop: NotificationLevels.NONE,
                mark_unread: NotificationLevels.NONE,
                push: NotificationLevels.ALL,
            },
        };

        const props = {...baseProps, channelMember};
        const wrapper = shallow(
            <ChannelNotificationsModal {...props}/>
        );

        const instance = wrapper.instance();
        instance.updateSection = jest.fn();

        wrapper.setState({pushNotifyLevel: NotificationLevels.NONE});
        instance.handleUpdatePushSection();
        expect(wrapper.state('pushNotifyLevel')).toEqual(NotificationLevels.ALL);

        expect(instance.updateSection).toHaveBeenCalledTimes(1);
        expect(instance.updateSection).toBeCalledWith(NotificationSections.NONE);

        instance.handleUpdatePushSection(NotificationSections.PUSH);
        expect(instance.updateSection).toHaveBeenCalledTimes(2);
        expect(instance.updateSection).toBeCalledWith(NotificationSections.PUSH);
    });
});
