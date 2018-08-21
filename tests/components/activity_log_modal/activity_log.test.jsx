// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {General} from 'mattermost-redux/constants';

import ActivityLog from 'components/activity_log_modal/components/activity_log.jsx';

describe('components/activity_log_modal/ActivityLog', () => {
    const baseProps = {
        index: 0,
        locale: General.DEFAULT_LOCALE,
        currentSession: {props: {os: 'Linux', platform: 'Linux', browser: 'Desktop App'}, id: 'sessionId'},
        lastAccessTime: new Date(Date.UTC(2018, 8, 20, 12, 15)),
        firstAccessTime: new Date(Date.UTC(2018, 6, 20, 12, 15)),
        devicePlatform: 'Linux',
        devicePicture: 'fa fa-linux',
        deviceTitle: 'Linux Icon',
        moreInfo: false,
        handleMoreInfo: jest.fn(),
        submitRevoke: jest.fn(),
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <ActivityLog {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('functions are called correctly', () => {
        const wrapper = shallow(
            <ActivityLog {...baseProps}/>
        );

        wrapper.instance().handleMoreInfo();
        expect(baseProps.handleMoreInfo).toBeCalled();
        expect(baseProps.handleMoreInfo).toHaveBeenCalledTimes(1);
        expect(baseProps.handleMoreInfo).toBeCalledWith(0);

        wrapper.instance().submitRevoke('e');
        expect(baseProps.submitRevoke).toBeCalled();
        expect(baseProps.submitRevoke).toHaveBeenCalledTimes(1);
        expect(baseProps.submitRevoke).toBeCalledWith('sessionId', 'e');
    });
});
