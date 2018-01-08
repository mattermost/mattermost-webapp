// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {NotificationLevels, NotificationSections} from 'utils/constants.jsx';

import ChannelMarkUnreadNotificationSection from 'components/channel_mark_unread_notification_section.jsx';

describe('components/ChannelMarkUnreadNotificationSection', () => {
    const baseProps = {
        expand: false,
        onChange: () => {},         //eslint-disable-line no-empty-function
        onSubmit: () => {},         //eslint-disable-line no-empty-function
        onUpdateSection: () => {},  //eslint-disable-line no-empty-function
        serverError: ''
    };

    test('should match snapshot, not expanded view, member notification default to all', () => {
        const wrapper = shallow(
            <ChannelMarkUnreadNotificationSection {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, not expanded view, member notification to mention', () => {
        const props = {...baseProps, notificationLevel: NotificationLevels.MENTION};
        const wrapper = shallow(
            <ChannelMarkUnreadNotificationSection {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, expanded view, member notification to all', () => {
        const props = {...baseProps, expand: true, notificationLevel: NotificationLevels.ALL};
        const wrapper = shallow(
            <ChannelMarkUnreadNotificationSection {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, expanded view, member notification to mention', () => {
        const props = {...baseProps, expand: true, notificationLevel: NotificationLevels.MENTION};
        const wrapper = shallow(
            <ChannelMarkUnreadNotificationSection {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should have called onChange when handleOnChange is called', () => {
        const onChange = jest.fn();
        const props = {...baseProps, expand: true, onChange};
        const wrapper = shallow(
            <ChannelMarkUnreadNotificationSection {...props}/>
        );
        wrapper.instance().handleOnChange({target: {value: NotificationLevels.ALL}});
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(NotificationLevels.ALL);
    });

    test('should have called onUpdateSection when handleExpandSection is called', () => {
        const onUpdateSection = jest.fn();
        const props = {...baseProps, expand: true, onUpdateSection};
        const wrapper = shallow(
            <ChannelMarkUnreadNotificationSection {...props}/>
        );
        wrapper.instance().handleExpandSection({preventDefault: jest.fn()});
        expect(onUpdateSection).toHaveBeenCalledTimes(1);
        expect(onUpdateSection).toHaveBeenCalledWith(NotificationSections.MARK_UNREAD);
    });

    test('should have called onUpdateSection when handleCollapseSection is called', () => {
        const onUpdateSection = jest.fn();
        const props = {...baseProps, expand: true, onUpdateSection};
        const wrapper = shallow(
            <ChannelMarkUnreadNotificationSection {...props}/>
        );
        wrapper.instance().handleCollapseSection({preventDefault: jest.fn()});
        expect(onUpdateSection).toHaveBeenCalledTimes(1);
        expect(onUpdateSection).toHaveBeenCalledWith();
    });

    test('should match snapshot on server error', () => {
        const props = {...baseProps, serverError: 'server error occurred'};
        const wrapper = shallow(
            <ChannelMarkUnreadNotificationSection {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when getDescribe is called', () => {
        const props = {...baseProps, expand: true};
        const wrapper = shallow(
            <ChannelMarkUnreadNotificationSection {...props}/>
        );

        expect(wrapper.instance().getDescribe(NotificationLevels.MENTION)).toMatchSnapshot();
        expect(wrapper.instance().getDescribe(NotificationLevels.ALL)).toMatchSnapshot();
    });
});
