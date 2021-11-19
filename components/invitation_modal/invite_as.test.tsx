// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {mountWithThemedIntl} from 'tests/helpers/themed-intl-test-helper';

import RadioGroup from 'components/common/radio_group';

import deepFreeze from 'mattermost-redux/utils/deep_freeze';
import {InviteToTeamTreatments} from 'mattermost-redux/constants/config';

import Toggle from 'components/toggle';

import InviteAs, {Props, InviteType} from './invite_as';

const defaultProps: Props = deepFreeze({
    setInviteAs: jest.fn(),
    inviteType: InviteType.MEMBER,
    inviteToTeamTreatment: InviteToTeamTreatments.NONE,
    titleClass: 'title',
});

let props = defaultProps;

describe('InviteAs', () => {
    beforeEach(() => {
        props = defaultProps;
    });
    describe('title', () => {
        it('does not mention guest in radio mode', () => {
            const wrapper = mountWithThemedIntl(<InviteAs {...props}/>);
            expect(wrapper.find('.' + props.titleClass).at(0).text()).toBe('Invite as');
        });

        it('mentions guest in toggle mode', () => {
            props = {
                ...props,
                inviteToTeamTreatment: InviteToTeamTreatments.TOGGLE,
            };
            const wrapper = mountWithThemedIntl(<InviteAs {...props}/>);
            expect(wrapper.find('.' + props.titleClass).at(0).text()).toBe('Invite as Guest');
        });
    });
    describe('control', () => {
        it('shows radio buttons in radio mode', () => {
            const wrapper = shallow(<InviteAs {...props}/>);
            expect(wrapper.find(RadioGroup).length).toBe(1);
        });

        it('shows toggle in toggle mode', () => {
            props = {
                ...props,
                inviteToTeamTreatment: InviteToTeamTreatments.TOGGLE,
            };
            const wrapper = shallow(<InviteAs {...props}/>);
            expect(wrapper.find(Toggle).length).toBe(1);
        });
    });
});
