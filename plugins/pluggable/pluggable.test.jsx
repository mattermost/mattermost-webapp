// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount, shallow} from 'enzyme';
import configureStore from 'redux-mock-store';
import {Provider} from 'react-redux';

import {getMembershipForCurrentEntities} from 'actions/views/profile_popover';

import Pluggable from 'plugins/pluggable/pluggable.jsx';
import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import ProfilePopover from 'components/profile_popover/profile_popover.jsx';

class ProfilePopoverPlugin extends React.PureComponent {
    render() {
        return <span id='pluginId'>{'ProfilePopoverPlugin'}</span>;
    }
}

jest.mock('actions/views/profile_popover');

describe('plugins/Pluggable', () => {
    const mockStore = configureStore();

    const membersInTeam = {};
    membersInTeam.someid = {};
    membersInTeam.someid.someid = {team_id: 'someid', user_id: 'someid', roles: 'team_user'};

    const membersInChannel = {};
    membersInChannel.someid = {};
    membersInChannel.someid.someid = {channel_id: 'someid', user_id: 'someid', roles: 'channel_user'};

    const store = mockStore({
        entities: {
            channels: {
                currentChannelId: 'someid',
                channels: {
                    someid: {team_id: 'someid', id: 'someid'},
                },
                membersInChannel,
            },
            general: {
                license: {IsLicensed: 'false'},
                config: {
                },
            },
            teams: {
                currentTeamId: 'someid',
                teams: {someid: {id: 'someid', name: 'somename'}},
                membersInTeam,
            },
            preferences: {
                myPreferences: {},
            },
            posts: {
                posts: {},
            },
            users: {
                currentUserId: 'someid',
                users: {someid: {id: 'someid', name: 'somename'}},
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
            </Provider>
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
            </Provider>
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
            />
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('#pluginId').text()).toBe('ProfilePopoverPlugin');
    });

    test('should return null if neither pluggableName nor children is is defined in props', () => {
        const wrapper = shallow(
            <Pluggable
                components={{PopoverSection1: [{component: ProfilePopoverPlugin}]}}
                theme={{id: 'theme_id'}}
            />
        );

        expect(wrapper.type()).toBe(null);
    });

    test('should return null if with pluggableName but no children', () => {
        const wrapper = shallow(
            <Pluggable
                pluggableName='PopoverSection1'
                components={{}}
                theme={{id: 'theme_id'}}
            />
        );

        expect(wrapper.type()).toBe(null);
    });

    test('should match snapshot with no overridden component', () => {
        getMembershipForCurrentEntities.mockImplementation((...args) => {
            return {type: 'MOCK_GET_MEMBERSHIP_FOR_CURRENT_ENTITIES', args};
        });

        const wrapper = mountWithIntl(
            <Provider store={store}>
                <Pluggable
                    components={{}}
                    theme={{}}
                >
                    <ProfilePopover
                        currentUserId='someid'
                        teamUrl='/somename'
                        isTeamAdmin={false}
                        isChannelAdmin={false}
                        user={{id: 'someid', name: 'name'}}
                        src='src'
                        actions={{
                            openDirectChannelToUserId: jest.fn(),
                            openModal: jest.fn(),
                            getMembershipForCurrentEntities: jest.fn(),
                            loadBot: jest.fn(),
                        }}
                    />
                </Pluggable>
            </Provider>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with overridden component', () => {
        const wrapper = mount(
            <Provider store={store}>
                <Pluggable
                    components={{ProfilePopover: [{component: ProfilePopoverPlugin}]}}
                    theme={{id: 'theme_id'}}
                >
                    <ProfilePopover
                        currentUserId='someid'
                        teamUrl='/somename'
                        isTeamAdmin={false}
                        isChannelAdmin={false}
                        user={{id: 'someid', name: 'name'}}
                        src='src'
                    />
                </Pluggable>
            </Provider>
        );

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('#pluginId').text()).toBe('ProfilePopoverPlugin');
    });
});
