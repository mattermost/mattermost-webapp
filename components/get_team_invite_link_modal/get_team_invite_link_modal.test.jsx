// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import GetTeamInviteLinkModal from 'components/get_team_invite_link_modal/get_team_invite_link_modal.jsx';
import GetLinkModal from 'components/get_link_modal.jsx';

describe('components/GetTeamInviteLinkModal', () => {
    test('should match snapshot when user creation is enabled', () => {
        const wrapper = shallow(
            <GetTeamInviteLinkModal
                config={{EnableUserCreation: 'true'}}
                currentTeam={{invite_id: 'invite_id'}}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when user creation is disabled', () => {
        const wrapper = shallow(
            <GetTeamInviteLinkModal
                config={{EnableUserCreation: 'false'}}
                currentTeam={{invite_id: 'invite_id'}}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should call handleToggle on GetLinkModal\'s onHide', () => {
        const wrapper = shallow(
            <GetTeamInviteLinkModal
                config={{EnableUserCreation: 'false'}}
                currentTeam={{invite_id: 'invite_id'}}
            />
        );

        wrapper.find(GetLinkModal).first().props().onHide();
        expect(wrapper.state('show')).toBe(false);
    });
});
