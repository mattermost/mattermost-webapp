// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {shallow, mount} from 'enzyme';

import EnableNotificationsBar from './enable_notifications_bar';

jest.mock('components/announcement_bar/default_announcement_bar');

describe('components/EnableNotificationsBar', () => {
    const baseProps = {
        show: false,
        actions: {
            enableBrowserNotifications: () => {},
            trackEnableNotificationsBarDisplay: () => {},
            disableNotificationsPermissionRequests: () => {},
        },
    };

    test('should match snapshot', () => {
        const props = baseProps;
        const wrapper = shallow<typeof EnableNotificationsBar>(
            <EnableNotificationsBar {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should call display tracker when displayed', () => {
        const trackEnableNotificationsBarDisplay = jest.fn();
        const props = {
            ...baseProps,
            actions: {
                ...baseProps.actions,
                trackEnableNotificationsBarDisplay,
            },
        };

        const wrapper = mount(<EnableNotificationsBar {...props}/>);
        expect(trackEnableNotificationsBarDisplay).not.toBeCalled();

        wrapper.setProps({show: true});
        expect(trackEnableNotificationsBarDisplay).toBeCalled();
    });
});
