// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount, shallow} from 'enzyme';
import configureStore from 'redux-mock-store';
import {Provider} from 'react-redux';

import Pluggable from 'plugins/pluggable/pluggable.jsx';
import {mountWithIntl} from 'tests/helpers/intl-test-helper';

class ProfilePopoverPlugin extends React.PureComponent {
    render() {
        return <span id='pluginId'>{'ProfilePopoverPlugin'}</span>;
    }
}

jest.mock('actions/views/profile_popover');

describe('plugins/Pluggable', () => {
    const mockStore = configureStore();

    const membersInTeam = {};
    membersInTeam.someTeamId = {};
    membersInTeam.someTeamId.someUserId = {team_id: 'someTeamId', user_id: 'someUserId', roles: 'team_user'};

    const membersInChannel = {};
    membersInChannel.someChannelId = {};
    membersInChannel.someChannelId.someUserId = {channel_id: 'someChannelId', user_id: 'someUserId', roles: 'channel_user'};

    const store = mockStore({
        entities: {
            channels: {
                currentChannelId: 'someChannelId',
                channels: {
                    someChannelId: {team_id: 'someTeamId', id: 'someChannelId'},
                },
                membersInChannel,
                myMembers: {},
            },
            general: {
                license: {IsLicensed: 'false'},
                config: {
                },
            },
            teams: {
                membersInTeam,
                currentTeamId: 'someTeamId',
                teams: {
                    someTeamId: {
                        id: 'someTeamId',
                        name: 'someTeamName',
                    },
                },
            },
            preferences: {
                myPreferences: {},
            },
            posts: {
                posts: {},
            },
            users: {
                currentUserId: 'someUserId',
                users: {someUserId: {id: 'someUserId', name: 'some_user_name'}},
                profiles: {},
                statuses: {
                    someUserId: 'online',
                },
            },
            roles: {
                roles: {},
            },
            bots: {
                accounts: {},
            },
        },
        plugins: {
            components: {},
        },
        views: {
            posts: {
            },
            channel: {
            },
            rhs: {},
        },
    });

    test('should match snapshot with no extended component', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <Pluggable
                    components={{}}
                    theme={{}}
                />
            </Provider>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with extended component', () => {
        const wrapper = mount(
            <Provider store={store}>
                <Pluggable
                    pluggableName='PopoverSection1'
                    components={{PopoverSection1: [{component: ProfilePopoverPlugin}]}}
                    theme={{id: 'theme_id'}}
                />
            </Provider>,
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('#pluginId').text()).toBe('ProfilePopoverPlugin');
    });

    test('should match snapshot with extended component with pluggableName', () => {
        const wrapper = mountWithIntl(
            <Pluggable
                pluggableName='PopoverSection1'
                components={{PopoverSection1: [{component: ProfilePopoverPlugin}]}}
                theme={{id: 'theme_id'}}
            />,
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('#pluginId').text()).toBe('ProfilePopoverPlugin');
    });

    test('should return null if neither pluggableName nor children is is defined in props', () => {
        const wrapper = shallow(
            <Pluggable
                components={{PopoverSection1: [{component: ProfilePopoverPlugin}]}}
                theme={{id: 'theme_id'}}
            />,
        );

        expect(wrapper.type()).toBe(null);
    });

    test('should return null if with pluggableName but no children', () => {
        const wrapper = shallow(
            <Pluggable
                pluggableName='PopoverSection1'
                components={{}}
                theme={{id: 'theme_id'}}
            />,
        );

        expect(wrapper.type()).toBe(null);
    });

    test('should match snapshot with non-null pluggableId', () => {
        const wrapper = mount(
            <Pluggable
                pluggableName='PopoverSection1'
                pluggableId={'pluggableId'}
                components={{PopoverSection1: [{component: ProfilePopoverPlugin}]}}
                theme={{id: 'theme_id'}}
            />,
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.children().length).toBe(0);
    });

    test('should match snapshot with null pluggableId', () => {
        const wrapper = mount(
            <Pluggable
                pluggableName='PopoverSection1'
                pluggableId={null}
                components={{PopoverSection1: [{component: ProfilePopoverPlugin}]}}
                theme={{id: 'theme_id'}}
            />,
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.children().length).toBe(1);
    });

    test('should match snapshot with valid pluggableId', () => {
        const wrapper = mount(
            <Pluggable
                pluggableName='PopoverSection1'
                pluggableId={'pluggableId'}
                components={{PopoverSection1: [{id: 'pluggableId', component: ProfilePopoverPlugin}]}}
                theme={{id: 'theme_id'}}
            />,
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.children().length).toBe(1);
        expect(wrapper.childAt(0).type()).toBe(ProfilePopoverPlugin);
    });
});
