// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {IntlShape} from 'react-intl';

import {mountWithThemedIntl} from 'tests/helpers/themed-intl-test-helper';

import deepFreeze from 'mattermost-redux/utils/deep_freeze';
import {InviteToTeamTreatments} from 'mattermost-redux/constants/config';
import {Team} from 'mattermost-redux/types/teams';

import ResultView from './result_view';
import InviteView from './invite_view';
import NoPermissionsView from './no_permissions_view';
import InvitationModal, {Props, View, InvitationModal as BaseInvitationModal} from './invitation_modal';

const defaultProps: Props = deepFreeze({
    show: true,
    inviteToTeamTreatment: InviteToTeamTreatments.NONE,
    actions: {
        closeModal: jest.fn(),
        searchChannels: jest.fn(),
        regenerateTeamInviteId: jest.fn(),

        searchProfiles: jest.fn(),
        sendGuestsInvites: jest.fn(),
        sendMembersInvites: jest.fn(),
    },
    currentTeam: {
        display_name: '',
    } as Team,
    currentChannel: {
        display_name: '',
    },
    invitableChannels: [],
    emailInvitationsEnabled: true,
    isAdmin: false,
    isCloud: false,
    cloudUserLimit: '',
    canAddUsers: true,
    canInviteGuests: true,
    intl: {} as IntlShape,
    townSquareDisplayName: '',
});

let props = defaultProps;

describe('InvitationModal', () => {
    beforeEach(() => {
        props = defaultProps;
    });

    it('shows invite view when view state is invite', () => {
        const wrapper = mountWithThemedIntl(<InvitationModal {...props}/>);
        expect(wrapper.find(InviteView).length).toBe(1);
    });

    it('shows result view when view state is result', () => {
        const wrapper = mountWithThemedIntl(<InvitationModal {...props}/>);
        wrapper.find(BaseInvitationModal).at(0).setState({view: View.RESULT});

        wrapper.update();
        expect(wrapper.find(ResultView).length).toBe(1);
    });

    it('shows no permissions view when user can neither invite users nor guests', () => {
        props = {
            ...props,
            canAddUsers: false,
            canInviteGuests: false,
        };
        const wrapper = mountWithThemedIntl(<InvitationModal {...props}/>);

        expect(wrapper.find(NoPermissionsView).length).toBe(1);
    });
});
