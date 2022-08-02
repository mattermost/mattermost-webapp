// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {NotificationSections} from 'utils/constants';

import ExtraInfo from 'components/channel_notifications_modal/components/extra_info.jsx';

describe('components/channel_notifications_modal/ExtraInfo', () => {
    const baseProps = {
        section: NotificationSections.DESKTOP,
    };

    test('should match snapshot, on DESKTOP', () => {
        const wrapper = shallow(
            <ExtraInfo {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on PUSH', () => {
        const props = {...baseProps, section: NotificationSections.PUSH};
        const wrapper = shallow(
            <ExtraInfo {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on MARK_UNREAD', () => {
        const props = {...baseProps, section: NotificationSections.MARK_UNREAD};
        const wrapper = shallow(
            <ExtraInfo {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
