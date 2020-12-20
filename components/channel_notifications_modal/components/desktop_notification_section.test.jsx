// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {NotificationLevels} from 'utils/constants';

import DesktopNotificationSection from 'components/channel_notifications_modal/components/desktop_notification_section.jsx';
import * as Utils from '../../../utils/utils';

describe('components/channel_notifications_modal/DesktopNotificationSection', () => {
    const baseProps = {
        onChange: () => {}, //eslint-disable-line no-empty-function
        onSubmit: () => {}, //eslint-disable-line no-empty-function
        serverError: '',
        onCollapseSection: () => {}, //eslint-disable-line no-empty-function
        memberNotifyLevel: NotificationLevels.DEFAULT,
        globalNotifyLevel: NotificationLevels.DEFAULT,
        memberDesktopSound: undefined,
        globalDesktopSound: 'true',
        memberDesktopNotificationSound: undefined,
        globalDesktopNotificationSound: 'Bing',
        handleUpdateDesktopSound: () => {}, //eslint-disable-line no-empty-function
        handleUpdateDesktopNotificationSound: () => {}, //eslint-disable-line no-empty-function
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should match snapshot default global settings', () => {
        const wrapper = shallow(
            <DesktopNotificationSection {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should show notification options', () => {
        const userAgentMock = jest.requireMock('../../../utils/user_agent');
        userAgentMock.isDesktopApp.mockImplementationOnce(() => false);

        jest.spyOn(Utils, 'hasSoundOptions').mockImplementationOnce(() => true);

        const props = {
            ...baseProps,
            globalNotifyLevel: NotificationLevels.ALL,
            globalDesktopSound: 'true',
        };

        const wrapper = shallow(
            <DesktopNotificationSection {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should not show notification options when browser not supported', () => {
        const userAgentMock = jest.requireMock('../../../utils/user_agent');
        userAgentMock.isDesktopApp.mockImplementationOnce(() => true);

        jest.spyOn(Utils, 'hasSoundOptions').mockImplementationOnce(() => false);

        const props = {
            ...baseProps,
            globalNotifyLevel: NotificationLevels.ALL,
            globalDesktopSound: 'true',
        };

        const wrapper = shallow(
            <DesktopNotificationSection {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should not show notification section when notify level is none', () => {
        const props = {
            ...baseProps,
            globalNotifyLevel: NotificationLevels.NONE,
        };

        const wrapper = shallow(
            <DesktopNotificationSection {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should show reset to defaults message', () => {
        jest.spyOn(Utils, 'hasSoundOptions').mockImplementationOnce(() => true);
        jest.spyOn(Utils, 'isMobile').mockImplementationOnce(() => false);

        const props = {
            ...baseProps,
            globalNotifyLevel: NotificationLevels.NONE,
            memberNotifyLevel: NotificationLevels.MENTION,
        };

        const wrapper = shallow(
            <DesktopNotificationSection {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should show reset to defaults icon for mobile', () => {
        jest.spyOn(Utils, 'hasSoundOptions').mockImplementationOnce(() => true);
        jest.spyOn(Utils, 'isMobile').mockImplementationOnce(() => true);

        const props = {
            ...baseProps,
            globalNotifyLevel: NotificationLevels.NONE,
            memberNotifyLevel: NotificationLevels.MENTION,
        };

        const wrapper = shallow(
            <DesktopNotificationSection {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
