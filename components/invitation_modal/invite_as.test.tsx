// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import RadioGroup from 'components/common/radio_group';

import deepFreeze from 'mattermost-redux/utils/deep_freeze';

import InviteAs, {Props, InviteType} from './invite_as';

const defaultProps: Props = deepFreeze({
    setInviteAs: jest.fn(),
    inviteType: InviteType.MEMBER,
    titleClass: 'title',
});

let props = defaultProps;

describe('InviteAs', () => {
    beforeEach(() => {
        props = defaultProps;
    });
    it('shows the radio buttons', () => {
        const wrapper = shallow(<InviteAs {...props}/>);
        expect(wrapper.find(RadioGroup).length).toBe(1);
    });
});
