// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import GroupProfile from 'components/admin_console/group_settings/group_details/group_profile.jsx';

describe('components/admin_console/group_settings/group_details/GroupProfile', () => {
    test('should match snapshot', () => {
        const wrapper = shallow(<GroupProfile
            isDisabled={false}
            name='Test'
            showAtMention={true}
            title='admin.group_settings.group_details.group_profile.name'
            titleDefault='Name:'/>);
        expect(wrapper).toMatchSnapshot();
    });
});