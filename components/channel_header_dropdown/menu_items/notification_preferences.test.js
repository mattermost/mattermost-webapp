// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Constants} from 'utils/constants';

import NotificationPreferences from './notification_preferences';

describe('components/ChannelHeaderDropdown/MenuItem.NotificationPreferences', () => {
    const baseProps = {
        user: {},
        channel: {
            type: Constants.OPEN_CHANNEL,
        },
        isArchived: false,
    };

    it('should match snapshot', () => {
        const wrapper = shallow(<NotificationPreferences {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('should be hidden if the channel type is DM', () => {
        const props = {
            ...baseProps,
            channel: {
                type: Constants.DM_CHANNEL,
            },
        };
        const wrapper = shallow(<NotificationPreferences {...props}/>);
        expect(wrapper.isEmptyRender()).toBeTruthy();
    });

    it('should be hidden if the channel is archived', () => {
        const props = {
            ...baseProps,
            isArchived: true,
        };
        const wrapper = shallow(<NotificationPreferences {...props}/>);
        expect(wrapper.isEmptyRender()).toBeTruthy();
    });
});
