// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import {Constants} from 'utils/constants';

import MainMenu from './main_menu.jsx';

describe('components/Menu', () => {
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
        },
        teamIsGroupConstrained: false,
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
        const wrapper = shallowWithIntl(<MainMenu {...props}/>);

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

    describe('should show integrations', () => {
        it('when incoming webhooks enabled', () => {
            const props = {...defaultProps, enableIncomingWebhooks: true};
            const wrapper = shallowWithIntl(<MainMenu {...props}/>);

            expect(wrapper.find('#integrations').prop('show')).toBe(true);
        });

        it('when outgoing webhooks enabled', () => {
            const props = {...defaultProps, enableOutgoingWebhooks: true};
            const wrapper = shallowWithIntl(<MainMenu {...props}/>);

            expect(wrapper.find('#integrations').prop('show')).toBe(true);
        });

        it('when slash commands enabled', () => {
            const props = {...defaultProps, enableCommands: true};
            const wrapper = shallowWithIntl(<MainMenu {...props}/>);

            expect(wrapper.find('#integrations').prop('show')).toBe(true);
        });

        it('when oauth providers enabled', () => {
            const props = {...defaultProps, enableOAuthServiceProvider: true};
            const wrapper = shallowWithIntl(<MainMenu {...props}/>);

            expect(wrapper.find('#integrations').prop('show')).toBe(true);
        });

        it('when can manage system bots', () => {
            const props = {...defaultProps, canManageSystemBots: true};
            const wrapper = shallowWithIntl(<MainMenu {...props}/>);

            expect(wrapper.find('#integrations').prop('show')).toBe(true);
        });

        it('unless mobile', () => {
            const props = {...defaultProps, mobile: true, canManageSystemBots: true};
            const wrapper = shallowWithIntl(<MainMenu {...props}/>);

            expect(wrapper.find('#integrations').prop('show')).toBe(false);
        });

        it('unless cannot manage integrations', () => {
            const props = {...defaultProps, canManageIntegrations: false, enableCommands: true};
            const wrapper = shallowWithIntl(<MainMenu {...props}/>);

            expect(wrapper.find('#integrations').prop('show')).toBe(false);
        });
    });
});
