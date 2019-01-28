// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Constants} from 'utils/constants.jsx';

import SystemUsersList from 'components/admin_console/system_users/list/system_users_list.jsx';

describe('components/admin_console/system_users/list', () => {
    const defaultProps = {
        users: [],
        usersPerPage: 0,
        total: 0,
        nextPage: jest.fn(),
        search: jest.fn(),
        focusOnMount: false,
        renderFilterRow: jest.fn(),
        teamId: '',
        filter: '',
        term: '',
        onTermChange: jest.fn(),
        mfaEnabled: false,
        enableUserAccessTokens: false,
        experimentalEnableAuthenticationTransfer: false,
        actions: {
            getUser: jest.fn(),
            updateTeamMemberSchemeRoles: jest.fn(),
            getTeamMembersForUser: jest.fn(),
            getTeamsForUser: jest.fn(),
            removeUserFromTeam: jest.fn(),
        },
    };

    test('should match default snapshot', () => {
        const props = defaultProps;
        const wrapper = shallow(<SystemUsersList {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    describe('should match default snapshot, with users', () => {
        const props = {
            ...defaultProps,
            users: [
                {id: 'id1'},
                {id: 'id2'},
                {id: 'id3', auth_service: Constants.LDAP_SERVICE},
                {id: 'id4', auth_service: Constants.SAML_SERVICE},
                {id: 'id5', auth_service: 'other service'},
            ],
        };

        it('and mfa enabled', () => {
            const wrapper = shallow(
                <SystemUsersList
                    {...props}
                    mfaEnabled={true}
                />
            );
            expect(wrapper).toMatchSnapshot();
        });

        it('and mfa disabled', () => {
            const wrapper = shallow(
                <SystemUsersList
                    {...props}
                    mfaEnabled={false}
                />
            );
            expect(wrapper).toMatchSnapshot();
        });
    });
});
