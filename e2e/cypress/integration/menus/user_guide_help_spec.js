// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @menu

import {getAdminAccount} from '../../support/env';
import {FixedCloudConfig} from '../../utils/constants';
import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Main menu', () => {
    let testTeam;
    let testUser;
    let testConfig;
    const sysadmin = getAdminAccount();
    before(() => {
        cy.apiGetConfig().then(({config}) => {
            testConfig = config;
        });
        cy.apiInitSetup().then(({team, user}) => {
            testTeam = team;
            testUser = user;
        });
    });

    describe('user help guide', () => {
        it('Should have all the menu items on click', () => {
            const {
                HELP_LINK,
                REPORT_A_PROBLEM_LINK,
            } = FixedCloudConfig.SupportSettings;

            cy.apiLogin(testUser);
            cy.visit(`/${testTeam.name}/channels/town-square`);
            cy.get('#channel-header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').within(() => {
                cy.get('#channelHeaderUserGuideButton').click();
                cy.get('.dropdown-menu').should('be.visible').within(() => {
                    cy.get('#askTheCommunityLink').should('be.visible');
                    cy.get('#askTheCommunityLink a').should('have.attr', 'href', 'https://mattermost.com/pl/default-ask-mattermost-community/');

                    cy.get('#helpResourcesLink').should('be.visible');
                    cy.get('#helpResourcesLink a').should('have.attr', 'href', testConfig.SupportSettings.HelpLink || HELP_LINK);

                    cy.get('#reportAProblemLink').should('be.visible');
                    cy.get('#reportAProblemLink a').should('have.attr', 'href', testConfig.SupportSettings.ReportAProblemLink || REPORT_A_PROBLEM_LINK);

                    cy.get('#keyboardShortcuts').should('be.visible');
                    cy.get('#keyboardShortcuts button').click();
                });
            });
            cy.get('#shortcutsModalLabel').should('be.visible');
        });

        it('Should not have askTheCommunityLink button when system console setting is false', () => {
            cy.apiLogin(sysadmin);

            // # Update config to turn EnableAskCommunityLink config setting
            cy.apiUpdateConfig({
                SupportSettings: {
                    EnableAskCommunityLink: false,
                },
            });
            cy.visit(`/${testTeam.name}/channels/town-square`);

            cy.get('#channel-header', {timeout: TIMEOUTS.ONE_MIN}).should('be.visible').within(() => {
                // # Click user help button
                cy.get('#channelHeaderUserGuideButton').click();
                cy.get('.dropdown-menu').should('be.visible').within(() => {
                    // * Check that Ask the community button is not visible
                    cy.get('#askTheCommunityLink').should('be.not.visible');
                    cy.get('#helpResourcesLink').should('be.visible');
                });
            });
        });

        it('Should have askTheCommunityLink system console setting', () => {
            cy.apiLogin(sysadmin);
            cy.visit('/admin_console/site_config/customization');

            cy.get('.admin-console', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').within(() => {
                cy.get('.admin-console__header').should('be.visible').and('have.text', 'Customization');
            });

            // * Check that enable ask community div exists
            cy.get("div[data-testid='SupportSettings.EnableAskCommunityLink']").scrollIntoView().should('be.visible');
        });
    });
});
