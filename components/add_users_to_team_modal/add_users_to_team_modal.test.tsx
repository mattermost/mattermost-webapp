// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {UserProfile} from 'mattermost-redux/types/users';
import {Team} from 'mattermost-redux/types/teams';

import AddUsersToTeamModal from './add_users_to_team_modal';

describe('components/admin_console/add_users_to_team_modal/AddUsersToTeamModal', () => {
    function createUser(id: string, username: string, bot: boolean): UserProfile {
        return {
            id,
            create_at: 1589222794545,
            update_at: 1589222794545,
            delete_at: 0,
            username,
            auth_data: '',
            auth_service: '',
            email: '',
            email_verified: true,
            nickname: username,
            first_name: '',
            last_name: '',
            position: '',
            roles: 'system_user',
            locale: '',
            notify_props: {
                desktop: 'none',
                desktop_sound: 'false',
                email: 'false',
                mark_unread: 'mention',
                push: 'none',
                push_status: 'online',
                comments: 'any',
                first_name: 'false',
                channel: 'false',
                mention_keys: '',
            },
            terms_of_service_id: '',
            terms_of_service_create_at: 0,
            is_bot: bot,
            last_picture_update: 0,
        };
    }

    const user1 = createUser('userid1', 'user-1', false);
    const user2 = createUser('userid2', 'user-2', false);
    const removedUser = createUser('userid-not-removed', 'user-not-removed', false);
    const team: Team = {
        id: 'team-1',
        create_at: 1589222794545,
        update_at: 1589222794545,
        delete_at: 0,
        display_name: 'test-team',
        name: 'test-team',
        description: '',
        email: '',
        type: 'O',
        company_name: '',
        allowed_domains: '',
        invite_id: '',
        allow_open_invite: true,
        scheme_id: '',
        group_constrained: false,
    };

    const baseProps = {
        team,
        users: [user1, user2],

        excludeUsers: {},
        includeUsers: {},

        onAddCallback: jest.fn(),
        onHide: jest.fn(),

        actions: {
            getProfilesNotInTeam: jest.fn(),
            searchProfiles: jest.fn(),
        },
    };

    test('should match snapshot with 2 users', () => {
        const wrapper = shallow(
            <AddUsersToTeamModal
                {...baseProps}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with 2 users, 1 included and 1 removed', () => {
        const wrapper = shallow(
            <AddUsersToTeamModal
                {...baseProps}
                includeUsers={{[removedUser.id]: removedUser}}
                excludeUsers={{[user1.id]: user1}}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match state when onHide is called', () => {
        const wrapper = shallow(
            <AddUsersToTeamModal {...baseProps}/>,
        );

        wrapper.setState({show: true});
        (wrapper.instance() as AddUsersToTeamModal).handleHide();
        expect(wrapper.state('show')).toEqual(false);
    });

    test('should search', () => {
        const getProfilesNotInTeam = jest.fn();
        const searchProfiles = jest.fn();
        const wrapper = shallow(
            <AddUsersToTeamModal
                {...baseProps}
                actions={{
                    searchProfiles,
                    getProfilesNotInTeam,
                }}
            />,
        );
        const addUsers = wrapper.instance() as AddUsersToTeamModal;

        // search profiles when search term given
        addUsers.search('foo');
        expect(searchProfiles).toHaveBeenCalledTimes(1);
        expect(getProfilesNotInTeam).toHaveBeenCalledTimes(1);

        // get profiles when no search term
        addUsers.search('');
        expect(searchProfiles).toHaveBeenCalledTimes(1);
        expect(getProfilesNotInTeam).toHaveBeenCalledTimes(2);
    });
});
