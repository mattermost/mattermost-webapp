// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import NotificationPreferences from './notification_preferences';

describe('components/ChannelHeaderDropdown/MenuItem.NotificationPreferences', () => {
    it('should match snapshot', () => {
        const wrapper = shallow(
            <NotificationPreferences
                user={{}}
                channel={{}}
                membership={{}}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});
