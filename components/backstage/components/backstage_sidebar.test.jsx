// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import BackstageSidebar from './backstage_sidebar.jsx';
import BackstageCategory from './backstage_category.jsx';

describe('components/backstage/components/BackstageSidebar', () => {
    const defaultProps = {
        team: {
            id: 'team-id',
            name: 'team_name',
        },
        user: {},
        enableCustomEmoji: false,
        enableIncomingWebhooks: false,
        enableOutgoingWebhooks: false,
        enableCommands: false,
        enableOAuthServiceProvider: false,
        canCreateOrDeleteCustomEmoji: false,
        canManageIntegrations: false,
    };

    describe('custom emoji', () => {
        const testCases = [
            [{enableCustomEmoji: false, canCreateOrDeleteCustomEmoji: false}, false],
            [{enableCustomEmoji: false, canCreateOrDeleteCustomEmoji: true}, false],
            [{enableCustomEmoji: true, canCreateOrDeleteCustomEmoji: false}, false],
            [{enableCustomEmoji: true, canCreateOrDeleteCustomEmoji: true}, true],
        ];

        testCases.forEach(([testCaseProps, expected]) => {
            it(`when custom emoji is ${testCaseProps.enableCustomEmoji} and can create/delete is ${testCaseProps.canCreateOrDeleteCustomEmoji}`, () => {
                const props = {
                    ...defaultProps,
                    ...testCaseProps,
                };
                const wrapper = shallow(
                    <BackstageSidebar {...props}/>,
                );

                expect(wrapper.find(BackstageCategory).find({name: 'emoji'}).exists()).toBe(expected);
            });
        });
    });

    describe('incoming webhooks', () => {
        const testCases = [
            [{canManageIntegrations: false, enableIncomingWebhooks: false}, false],
            [{canManageIntegrations: false, enableIncomingWebhooks: true}, false],
            [{canManageIntegrations: true, enableIncomingWebhooks: false}, false],
            [{canManageIntegrations: true, enableIncomingWebhooks: true}, true],
        ];

        testCases.forEach(([testCaseProps, expected]) => {
            it(`when incoming webhooks is ${testCaseProps.enableIncomingWebhooks} and can manage integrations is ${testCaseProps.canManageIntegrations}`, () => {
                const props = {
                    ...defaultProps,
                    ...testCaseProps,
                };
                const wrapper = shallow(
                    <BackstageSidebar {...props}/>,
                );

                expect(wrapper.find(BackstageCategory).find({name: 'incoming_webhooks'}).exists()).toBe(expected);
            });
        });
    });

    describe('outgoing webhooks', () => {
        const testCases = [
            [{canManageIntegrations: false, enableOutgoingWebhooks: false}, false],
            [{canManageIntegrations: false, enableOutgoingWebhooks: true}, false],
            [{canManageIntegrations: true, enableOutgoingWebhooks: false}, false],
            [{canManageIntegrations: true, enableOutgoingWebhooks: true}, true],
        ];

        testCases.forEach(([testCaseProps, expected]) => {
            it(`when outgoing webhooks is ${testCaseProps.enableOutgoingWebhooks} and can manage integrations is ${testCaseProps.canManageIntegrations}`, () => {
                const props = {
                    ...defaultProps,
                    ...testCaseProps,
                };
                const wrapper = shallow(
                    <BackstageSidebar {...props}/>,
                );

                expect(wrapper.find(BackstageCategory).find({name: 'outgoing_webhooks'}).exists()).toBe(expected);
            });
        });
    });

    describe('commands', () => {
        const testCases = [
            [{canManageIntegrations: false, enableCommands: false}, false],
            [{canManageIntegrations: false, enableCommands: true}, false],
            [{canManageIntegrations: true, enableCommands: false}, false],
            [{canManageIntegrations: true, enableCommands: true}, true],
        ];

        testCases.forEach(([testCaseProps, expected]) => {
            it(`when commands is ${testCaseProps.enableCommands} and can manage integrations is ${testCaseProps.canManageIntegrations}`, () => {
                const props = {
                    ...defaultProps,
                    ...testCaseProps,
                };
                const wrapper = shallow(
                    <BackstageSidebar {...props}/>,
                );

                expect(wrapper.find(BackstageCategory).find({name: 'commands'}).exists()).toBe(expected);
            });
        });
    });

    describe('oauth2 apps', () => {
        const testCases = [
            [{canManageIntegrations: false, enableOAuthServiceProvider: false}, false],
            [{canManageIntegrations: false, enableOAuthServiceProvider: true}, false],
            [{canManageIntegrations: true, enableOAuthServiceProvider: false}, false],
            [{canManageIntegrations: true, enableOAuthServiceProvider: true}, true],
        ];

        testCases.forEach(([testCaseProps, expected]) => {
            it(`when oauth2 apps is ${testCaseProps.enableOAuthServiceProvider} and can manage integrations is ${testCaseProps.canManageIntegrations}`, () => {
                const props = {
                    ...defaultProps,
                    ...testCaseProps,
                };
                const wrapper = shallow(
                    <BackstageSidebar {...props}/>,
                );

                expect(wrapper.find(BackstageCategory).find({name: 'oauth2-apps'}).exists()).toBe(expected);
            });
        });
    });

    describe('bots', () => {
        const testCases = [
            [{canManageIntegrations: false}, false],
            [{canManageIntegrations: true}, true],
        ];

        testCases.forEach(([testCaseProps, expected]) => {
            it(`when can manage integrations is ${testCaseProps.canManageIntegrations}`, () => {
                const props = {
                    ...defaultProps,
                    ...testCaseProps,
                };
                const wrapper = shallow(
                    <BackstageSidebar {...props}/>,
                );

                expect(wrapper.find(BackstageCategory).find({name: 'bots'}).exists()).toBe(expected);
            });
        });
    });

    describe('all integrations', () => {
        it('can manage integrations', () => {
            const props = {
                ...defaultProps,
                enableIncomingWebhooks: true,
                enableOutgoingWebhooks: true,
                enableCommands: true,
                enableOAuthServiceProvider: true,
                canManageIntegrations: true,
            };
            const wrapper = shallow(
                <BackstageSidebar {...props}/>,
            );

            expect(wrapper.find(BackstageCategory).find({name: 'incoming_webhooks'}).exists()).toBe(true);
            expect(wrapper.find(BackstageCategory).find({name: 'outgoing_webhooks'}).exists()).toBe(true);
            expect(wrapper.find(BackstageCategory).find({name: 'commands'}).exists()).toBe(true);
            expect(wrapper.find(BackstageCategory).find({name: 'oauth2-apps'}).exists()).toBe(true);
            expect(wrapper.find(BackstageCategory).find({name: 'bots'}).exists()).toBe(true);
        });

        it('cannot manage integrations', () => {
            const props = {
                ...defaultProps,
                enableIncomingWebhooks: true,
                enableOutgoingWebhooks: true,
                enableCommands: true,
                enableOAuthServiceProvider: true,
                canManageIntegrations: false,
            };
            const wrapper = shallow(
                <BackstageSidebar {...props}/>,
            );

            expect(wrapper.find(BackstageCategory).find({name: 'incoming_webhooks'}).exists()).toBe(false);
            expect(wrapper.find(BackstageCategory).find({name: 'outgoing_webhooks'}).exists()).toBe(false);
            expect(wrapper.find(BackstageCategory).find({name: 'commands'}).exists()).toBe(false);
            expect(wrapper.find(BackstageCategory).find({name: 'oauth2-apps'}).exists()).toBe(false);
            expect(wrapper.find(BackstageCategory).find({name: 'bots'}).exists()).toBe(false);
        });
    });
});
