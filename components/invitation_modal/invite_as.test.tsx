// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {IntlProvider} from 'react-intl';
import {mount, shallow} from 'enzyme';

import Radio from '@mattermost/compass-components/components/radio';

import deepFreeze from 'mattermost-redux/utils/deep_freeze';
import {InviteToTeamTreatments} from 'mattermost-redux/constants/config';
import {Theme} from 'mattermost-redux/types/themes';

import Toggle from 'components/toggle';
import CompassThemeProvider from 'components/compass_theme_provider/compass_theme_provider';

import InviteAs, {Props, As} from './invite_as';

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
    setInviteAs: jest.fn(),
    as: As.MEMBER,
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
            const wrapper = mount(<WithProviders><InviteAs {...props}/></WithProviders>);
            expect(wrapper.find('.' + props.titleClass).at(0).text()).toBe('Invite as');
        });

        it('mentions guest in toggle mode', () => {
            props = {
                ...props,
                inviteToTeamTreatment: InviteToTeamTreatments.TOGGLE,
            };
            const wrapper = mount(<WithProviders><InviteAs {...props}/></WithProviders>);
            expect(wrapper.find('.' + props.titleClass).at(0).text()).toBe('Invite as Guest');
        });
    });
    describe('control', () => {
        it('shows radio buttons in radio mode', () => {
            const wrapper = shallow(<InviteAs {...props}/>);
            expect(wrapper.find(Radio).length).toBe(2);
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
