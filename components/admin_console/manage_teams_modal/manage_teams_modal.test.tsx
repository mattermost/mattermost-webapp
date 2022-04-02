// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount, shallow} from 'enzyme';

import {IntlProvider} from 'react-intl';

import {General} from 'mattermost-redux/constants';

import ManageTeamsModal from 'components/admin_console/manage_teams_modal/manage_teams_modal';

import {TestHelper} from 'utils/test_helper';

describe('ManageTeamsModal', () => {
    const baseProps = {
        locale: General.DEFAULT_LOCALE,
        onModalDismissed: jest.fn(),
        show: true,
        user: TestHelper.getUserMock({
            id: 'currentUserId',
            last_picture_update: 1234,
            email: 'currentUser@test.com',
            roles: 'system_user',
            username: 'currentUsername',
        }),
        actions: {
            getTeamMembersForUser: jest.fn().mockReturnValue(Promise.resolve({data: []})),
            getTeamsForUser: jest.fn().mockReturnValue(Promise.resolve({data: []})),
            updateTeamMemberSchemeRoles: jest.fn(),
            removeUserFromTeam: jest.fn(),
        },
    };

    test('should match snapshot init', () => {
        const wrapper = shallow(<ManageTeamsModal {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should call api calls when user changes', () => {
        const newUser = TestHelper.getUserMock({
            id: 'newUserId',
            last_picture_update: 1234,
            email: 'newUser@test.com',
            username: 'newUsername',
        });

        const wrapper = shallow(<ManageTeamsModal {...baseProps}/>);
        console.log(wrapper.debug());
        wrapper.setProps({user: newUser});
        console.log(wrapper.debug());

        expect(baseProps.actions.getTeamMembersForUser).toHaveBeenCalledTimes(1);
        expect(baseProps.actions.getTeamMembersForUser).toHaveBeenCalledWith(newUser.id);
        expect(baseProps.actions.getTeamsForUser).toHaveBeenCalledTimes(1);
        expect(baseProps.actions.getTeamsForUser).toHaveBeenCalledWith(newUser.id);
    });

    test('should save data in state from api calls', (done) => {
        const mockTeamData = TestHelper.getTeamMock({
            id: '123test',
            name: 'testTeam',
            display_name: 'testTeam',
            delete_at: 0,
        });

        const getTeamMembersForUser = jest.fn().mockReturnValue(Promise.resolve({data: [{team_id: '123test'}]}));
        const getTeamsForUser = jest.fn().mockReturnValue(Promise.resolve({data: [mockTeamData]}));

        const props = {
            ...baseProps,
            actions: {
                ...baseProps.actions,
                getTeamMembersForUser,
                getTeamsForUser,
            },
        };
        const intlProviderProps = {
            defaultLocale: 'en',
            locale: 'en',
            messages: {'test.value': 'Actual value'},
        };

        // const wrapper = mount(
        //     <IntlProvider {...intlProviderProps}>
        //         <ManageTeamsModal {...props}/>
        //     </IntlProvider>,
        // );

        const wrapper = shallow(<ManageTeamsModal {...props}/>);
        wrapper.find('#userId').simulate('change', {target: {value: 'newUserId'}});

        console.log(wrapper.debug());

        process.nextTick(() => {
            console.log(wrapper.instance());
            expect(wrapper.state('teams')).toEqual([mockTeamData]);
            expect(wrapper.state('teamMembers')).toEqual([{team_id: '123test'}]);
            expect(wrapper).toMatchSnapshot();
            done();
        });
    });
});
