// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {NotificationLevels, NotificationSections} from 'utils/constants';

import CollapseView from 'components/channel_notifications_modal/components/collapse_view.jsx';

describe('components/channel_notifications_modal/CollapseView', () => {
    const baseProps = {
        section: NotificationSections.DESKTOP,
        memberNotifyLevel: NotificationLevels.ALL,
        globalNotifyLevel: NotificationLevels.DEFAULT,
        onExpandSection: () => {}, //eslint-disable-line no-empty-function
    };

    test('should match snapshot, DESKTOP on collapsed view', () => {
        const wrapper = shallow(
            <CollapseView {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, PUSH on collapsed view', () => {
        const props = {...baseProps, section: NotificationSections.PUSH};
        const wrapper = shallow(
            <CollapseView {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, MARK_UNREAD on collapsed view', () => {
        const props = {...baseProps, section: NotificationSections.MARK_UNREAD, globalNotifyLevel: null};
        const wrapper = shallow(
            <CollapseView {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
