// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {IntlShape, IntlProvider} from 'react-intl';
import {mount} from 'enzyme';

// import {Modal} from 'react-bootstrap';

// import Radio from '@mattermost/compass-components/components/radio';

import deepFreeze from 'mattermost-redux/utils/deep_freeze';
import {InviteToTeamTreatments} from 'mattermost-redux/constants/config';
import {Team} from 'mattermost-redux/types/teams';
import {Theme} from 'mattermost-redux/types/themes';

import CompassThemeProvider from 'components/compass_theme_provider/compass_theme_provider';

import ResultView from './result_view';
import InviteView from './invite_view';
import InvitationModal, {Props, View, InvitationModal as BaseInvitationModal} from './invitation_modal';

type WithIntlProps = {
    children: React.ReactNode | React.ReactNodeArray;
};
const WithProviders = (props: WithIntlProps) => {
    return (
        <CompassThemeProvider
            theme={{
                sidebarHeaderBg: '#fff',
                sidebarHeaderTextColor: '#fff',
                dndIndicator: '#fff',
                onlineIndicator: '#fff',
                awayIndicator: '#fff',
            } as Theme}
        >
            <IntlProvider
                locale='en'
                messages={{}}
            >
                {props.children}
            </IntlProvider>
        </CompassThemeProvider>
    );
};

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
    currentChannelName: '',
    invitableChannels: [],
    emailInvitationsEnabled: true,
    isAdmin: false,
    isCloud: false,
    cloudUserLimit: '',
    intl: {} as IntlShape,
});

let props = defaultProps;

describe('InvitationModal', () => {
    beforeEach(() => {
        props = defaultProps;
    });

    it('shows invite view when view state is invite', () => {
        const wrapper = mount(<WithProviders><InvitationModal {...props}/></WithProviders>);
        expect(wrapper.find(InviteView).length).toBe(1);
    });

    it('shows result view when view state is result', () => {
        const wrapper = mount(<WithProviders><InvitationModal {...props}/></WithProviders>);
        wrapper.find(BaseInvitationModal).at(0).setState({view: View.RESULT});

        // wrapper.in
        wrapper.update();
        expect(wrapper.find(ResultView).length).toBe(1);
    });
});
