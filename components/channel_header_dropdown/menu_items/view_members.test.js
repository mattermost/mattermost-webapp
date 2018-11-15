// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Permissions} from 'mattermost-redux/constants';

import {Constants} from 'utils/constants';

import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';

import ViewMembers from './view_members';

describe('components/ChannelHeaderDropdown/MenuItem.ViewMembers', () => {
    const baseProps = {
        channel: {
            id: 'channel_id',
            team_id: 'team_id',
            type: Constants.OPEN_CHANNEL,
        },
        isDefault: false,
    };

    it('should match snapshot', () => {
        const wrapper = shallow(<ViewMembers {...baseProps}/>);

        expect(wrapper).toMatchSnapshot();
    });

    it('should appears without permission check if the channel is default channel', () => {
        const props = {
            ...baseProps,
            isDefault: true,
        };
        const wrapper = shallow(<ViewMembers {...props}/>);

        expect(wrapper.is(ChannelPermissionGate)).toBeFalsy();
    });

    it('should right permission level for channel type', () => {
        const props = baseProps;
        const makeWrapper = () => shallow(<ViewMembers {...props}/>);

        props.channel.type = Constants.OPEN_CHANNEL;
        expect(makeWrapper().prop('permissions')[0]).toBe(Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS);

        props.channel.type = Constants.PRIVATE_CHANNEL;
        expect(makeWrapper().prop('permissions')[0]).toBe(Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS);
    });
});
