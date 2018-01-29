// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {NotificationLevels, NotificationSections} from 'utils/constants.jsx';

import Describe from 'components/channel_notifications_modal/components/describe.jsx';

describe('components/channel_notifications_modal/NotificationSection', () => {
    const baseProps = {
        section: NotificationSections.DESKTOP,
        memberNotifyLevel: NotificationLevels.DEFAULT,
        globalNotifyLevel: NotificationLevels.DEFAULT
    };

    test('should match snapshot, on global DEFAULT', () => {
        const wrapper = shallow(
            <Describe {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on MENTION', () => {
        const props = {...baseProps, memberNotifyLevel: NotificationLevels.MENTION};
        const wrapper = shallow(
            <Describe {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on DESKTOP/PUSH & ALL', () => {
        const props = {...baseProps, memberNotifyLevel: NotificationLevels.ALL};
        const wrapper = shallow(
            <Describe {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on MARK_UNREAD & ALL', () => {
        const props = {...baseProps, section: NotificationSections.MARK_UNREAD, memberNotifyLevel: NotificationLevels.ALL, globalNotifyLevel: null};
        const wrapper = shallow(
            <Describe {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on NEVER', () => {
        const props = {...baseProps, memberNotifyLevel: NotificationLevels.NEVER};
        const wrapper = shallow(
            <Describe {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });
});
