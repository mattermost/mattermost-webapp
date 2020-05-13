// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {GroupProfileAndSettings} from './group_profile_and_settings.jsx';

describe('components/admin_console/group_settings/group_details/GroupProfileAndSettings', () => {
    test('should match snapshot, with toggle off', () => {
        const wrapper = shallow(
            <GroupProfileAndSettings
                displayname='GroupProfileAndSettings'
                mentionname='GroupProfileAndSettings'
                allowReference={false}
                onChange={jest.fn()}
                onToggle={jest.fn()}
            />);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, with toggle on', () => {
        const wrapper = shallow(
            <GroupProfileAndSettings
                displayname='GroupProfileAndSettings'
                mentionname='GroupProfileAndSettings'
                allowReference={true}
                onChange={jest.fn()}
                onToggle={jest.fn()}
            />);
        expect(wrapper).toMatchSnapshot();
    });
});