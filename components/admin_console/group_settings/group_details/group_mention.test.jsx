// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import GroupMention from 'components/admin_console/group_settings/group_details/group_mention.jsx';

describe('components/admin_console/group_settings/group_details/GroupMention', () => {
    test('should match snapshot', () => {
        const wrapper = shallow(<GroupMention name='Test'/>);
        expect(wrapper).toMatchSnapshot();
    });
});
