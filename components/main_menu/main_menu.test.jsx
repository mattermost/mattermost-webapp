// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';

import {mountWithIntl, shallowWithIntl} from 'tests/helpers/intl-test-helper';

import {Constants} from 'utils/constants';

import {Permissions} from 'mattermost-redux/constants';

import MainMenu from './main_menu.jsx';

describe('components/Menu', () => {
    // Neccessary for components enhanced by HOCs due to issue with enzyme.
    // See https://github.com/enzymejs/enzyme/issues/539
    const getMainMenuWrapper = (props) => {
        const wrapper = shallowWithIntl(<MainMenu {...props}/>);
        return wrapper.find('MainMenu').shallow();
    };

    const mockStore = configureStore();

    const defaultProps = {
        mobile: false,
        teamId: 'team-id',
        teamType: Constants.OPEN_TEAM,
        teamName: 'team_name',
        currentUser: {id: 'test-user-id'},
        appDownloadLink: null,
        enableCommands: false,
        enableCustomEmoji: false,
        enableIncomingWebhooks: false,
        enableOAuthServiceProvider: false,
        enableOutgoingWebhooks: false,
        canManageSystemBots: false,
        canCreateOrDeleteCustomEmoji: false,
        canManageIntegrations: true,
        enableUserCreation: false,
        enableEmailInvitations: false,
        enablePluginMarketplace: false,
        experimentalPrimaryTeam: null,
        helpLink: null,
        reportAProblemLink: null,
        moreTeamsToJoin: false,
        pluginMenuItems: [],
        isMentionSearch: false,
        showGettingStarted: false,
        actions: {
            openModal: jest.fn(),
            showMentions: jest.fn(),
            showFlaggedPosts: jest.fn(),
            closeRightHandSide: jest.fn(),
            closeRhsMenu: jest.fn(),
            unhideNextSteps: jest.fn(),
            getSubscriptionStats: jest.fn(),
        },
        teamIsGroupConstrained: false,
        isCloud: false,
        subscription: {},
        userIsAdmin: true,
    };

    const defaultState = {
        entities: {
            channels: {
                myMembers: [],
            },
            teams: {
                currentTeamId: 'team-id',
                myMembers: {
                    'team-id': {
                        team_id: 'team-id',
                        user_id: 'test-user-id',
                        roles: 'team_user',
                        scheme_user: 'true',
                    },
                },
            },
            users: {
                currentUserId: 'test-user-id',
                profiles: {
                    'test-user-id': {
                        id: 'test-user-id',
                        roles: 'system_user system_manager',
                    },
                },
            },
            roles: {
                roles: {
                    system_manager: {
                        permissions: [
                            Permissions.SYSCONSOLE_WRITE_PLUGINS,
                        ],
                    },
                },
            },
        },
    };

    test('should match snapshot with id', () => {
        const props = {...defaultProps, id: 'test-id'};
        const wrapper = shallowWithIntl(<MainMenu {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with most of the thing disabled', () => {
        const wrapper = shallowWithIntl(<MainMenu {...defaultProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with most of the thing disabled in mobile', () => {
        const props = {...defaultProps, mobile: true};
        const wrapper = shallowWithIntl(<MainMenu {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with most of the thing enabled', () => {
        const props = {
            ...defaultProps,
            appDownloadLink: 'test',
            enableCommands: true,
            enableCustomEmoji: true,
            canCreateOrDeleteCustomEmoji: true,
            enableIncomingWebhooks: true,
            enableOAuthServiceProvider: true,
            enableOutgoingWebhooks: true,
            enableUserCreation: true,
            enableEmailInvitations: true,
            enablePluginMarketplace: true,
            experimentalPrimaryTeam: 'test',
            helpLink: 'test-link-help',
            reportAProblemLink: 'test-report-link',
            moreTeamsToJoin: true,
        };
        const wrapper = shallowWithIntl(<MainMenu {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with most of the thing enabled in mobile', () => {
        const props = {
            ...defaultProps,
            mobile: true,
            appDownloadLink: 'test',
            enableCommands: true,
            enableCustomEmoji: true,
            canCreateOrDeleteCustomEmoji: true,
            enableIncomingWebhooks: true,
            enableOAuthServiceProvider: true,
            enableOutgoingWebhooks: true,
            enableUserCreation: true,
            enableEmailInvitations: true,
            enablePluginMarketplace: true,
            experimentalPrimaryTeam: 'test',
            helpLink: 'test-link-help',
            reportAProblemLink: 'test-report-link',
            moreTeamsToJoin: true,
        };
        const wrapper = shallowWithIntl(<MainMenu {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with plugins', () => {
        const props = {
            ...defaultProps,
            pluginMenuItems: [
                {id: 'plugin-1', action: jest.fn(), text: 'plugin-1-text', mobileIcon: 'plugin-1-mobile-icon'},
                {id: 'plugin-2', action: jest.fn(), text: 'plugin-2-text', mobileIcon: 'plugin-2-mobile-icon'},
            ],
        };
        const wrapper = shallowWithIntl(<MainMenu {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with plugins in mobile', () => {
        const props = {
            ...defaultProps,
            mobile: true,
            pluginMenuItems: [
                {id: 'plugin-1', action: jest.fn(), text: 'plugin-1-text', mobileIcon: 'plugin-1-mobile-icon'},
                {id: 'plugin-2', action: jest.fn(), text: 'plugin-2-text', mobileIcon: 'plugin-2-mobile-icon'},
            ],
        };
        const wrapper = shallowWithIntl(<MainMenu {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should show leave team option when primary team is set', () => {
        const props = {...defaultProps, teamIsGroupConstrained: false, experimentalPrimaryTeam: null};
        const wrapper = getMainMenuWrapper(props);

        // show leave team option when experimentalPrimaryTeam is not set
        expect(wrapper.find('#leaveTeam')).toHaveLength(1);
        expect(wrapper.find('#leaveTeam').props().show).toEqual(true);

        // hide leave team option when experimentalPrimaryTeam is same as current team
        wrapper.setProps({experimentalPrimaryTeam: defaultProps.teamName});
        expect(wrapper.find('#leaveTeam')).toHaveLength(1);
        expect(wrapper.find('#leaveTeam').props().show).toEqual(false);

        // show leave team option when experimentalPrimaryTeam is set to other team
        wrapper.setProps({experimentalPrimaryTeam: 'other_name'});
        expect(wrapper.find('#leaveTeam')).toHaveLength(1);
        expect(wrapper.find('#leaveTeam').props().show).toEqual(true);
    });

    test('mobile view should hide the subscribe now button when does not have permissions', () => {
        const noPermissionsState = {...defaultState};
        noPermissionsState.entities.roles.roles.system_manager.permissions = [];
        const store = mockStore(noPermissionsState);

        const wrapper = mountWithIntl(
            <Provider store={store}>
                <MainMenu {...defaultProps}/>
            </Provider>,
        );

        expect(wrapper.find('UpgradeLink')).toHaveLength(0);
    });

    test('mobile view should hide start trial menu item because user state does not have permission to write license', () => {
        const store = mockStore(defaultState);

        const wrapper = mountWithIntl(
            <Provider store={store}>
                <MainMenu {...defaultProps}/>
            </Provider>,
        );

        expect(wrapper.find('#startTrial')).toHaveLength(0);
    });
});
