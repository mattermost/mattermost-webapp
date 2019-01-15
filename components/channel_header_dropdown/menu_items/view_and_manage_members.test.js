// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Constants} from 'utils/constants';

import ViewAndManageMembers from './view_and_manage_members';

describe('components/ChannelHeaderDropdown/MenuItem.ViewAndManageMembers', () => {
    const baseProps = {
        channel: {
            type: Constants.OPEN_CHANNEL,
        },
        isDefault: false,
    };

    it('should match snapshot', () => {
        const wrapper = shallow(<ViewAndManageMembers {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot when the channel is town square', () => {
        const props = {
            ...baseProps,
            isDefault: true,
        };
        const wrapper = shallow(<ViewAndManageMembers {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('should be hidden if the channel type is DM or GM', () => {
        const props = {
            ...baseProps,
            channel: {
                ...baseProps.channel,
            },
        };
        const makeWrapper = () => shallow(<ViewAndManageMembers {...props}/>);

        props.channel.type = Constants.DM_CHANNEL;
        expect(makeWrapper().isEmptyRender()).toBeTruthy();

        props.channel.type = Constants.GM_CHANNEL;
        expect(makeWrapper().isEmptyRender()).toBeTruthy();
    });
});
