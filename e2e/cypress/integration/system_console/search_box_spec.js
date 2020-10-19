// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @system_console

import * as TIMEOUTS from '../../fixtures/timeouts';

// # Goes to the System Scheme page as System Admin
const goToAdminConsole = () => {
    cy.apiAdminLogin();
    cy.visit('/admin_console');
};

describe('System console', () => {
    it('MM-T897_1 - Focus should be in System Console search box on opening System Console or refreshing pages in System Console', () => {
        // * Check if server has license
        cy.apiRequireLicense();

        const pageIds = ['reporting\\/system_analytics', 'reporting\\/team_statistics', 'reporting\\/server_logs', 'user_management\\/users', 'user_management\\/teams'];
        goToAdminConsole();

        // * Assert the ID of the element is the ID of admin sidebar filter
        cy.focused().should('have.id', 'adminSidebarFilter');
        cy.wait(TIMEOUTS.ONE_SEC);

        pageIds.forEach((id) => {
            // # Go to another page
            cy.get(`#${id}`).click();

            // * Ensure focus is lost
            cy.focused().should('not.have.id', 'adminSidebarFilter');

            // * Reload and ensure the focus is back on the search component
            cy.reload();
            cy.focused().should('have.id', 'adminSidebarFilter');
            cy.wait(TIMEOUTS.ONE_SEC);
        });
    });

    it('MM-T897_2 - System Console menu footer should not cut off at the bottom', () => {
        goToAdminConsole();

        // * Scroll to the last item of the page and ensure it can be clicked
        cy.findByTestId('experimental.bleve').scrollIntoView().click();
    });

    it('MM-T898 - Individual plugins can be searched for via the System Console search box', () => {
        // # Uninstall all plugins
        const uninstallAllPlugins = () => {
            cy.apiGetAllPlugins().then(({plugins}) => {
                const {active, inactive} = plugins;
                inactive.forEach((plugin) => cy.apiRemovePluginById(plugin.id));
                active.forEach((plugin) => cy.apiRemovePluginById(plugin.id));
            });
        };

        goToAdminConsole();

        // # Enable Plugin Marketplace and Remote Marketplace
        cy.apiUpdateConfig({
            PluginSettings: {
                Enable: true,
                EnableMarketplace: true,
                EnableRemoteMarketplace: true,
                MarketplaceUrl: 'https://api.integrations.mattermost.com',
            },
        });

        cy.apiInstallPluginFromUrl('https://github.com/mattermost/mattermost-plugin-antivirus/releases/download/v0.1.2/antivirus-0.1.2.tar.gz', true);
        cy.apiInstallPluginFromUrl('https://github.com/mattermost/mattermost-plugin-autolink/releases/download/v1.2.1/mattermost-autolink-1.2.1.tar.gz', true);
        cy.apiInstallPluginFromUrl('https://github.com/mattermost/mattermost-plugin-aws-SNS/releases/download/v1.1.0/com.mattermost.aws-sns-1.1.0.tar.gz', true);

        // # A bug with the endpoint used for downloading plugins which doesn't send websocket events out so state is not updated
        // # Therefore, we visit town-square to update the state of our app then re-visit admin console
        cy.visit('ad-1/channels/town-square');
        cy.wait(TIMEOUTS.FIVE_SEC);
        goToAdminConsole();

        // # Type first plugin name
        cy.get('#adminSidebarFilter').type('Anti');
        cy.wait(TIMEOUTS.ONE_SEC);

        // * Ensure anti virus plugin is highlighted
        cy.get('#plugins\\/plugin_antivirus').then((el) => {
            expect(el[0].innerHTML).includes('markjs');
        });

        // # Type second plugin name
        cy.get('#adminSidebarFilter').clear().type('Auto');
        cy.wait(TIMEOUTS.ONE_SEC);

        // * Ensure autolink plugin is highlighted
        cy.get('#plugins\\/plugin_mattermost-autolink').then((el) => {
            expect(el[0].innerHTML).includes('markjs');
        });

        // # Type third plugin name
        cy.get('#adminSidebarFilter').clear().type('AWS SN');
        cy.wait(TIMEOUTS.ONE_SEC);

        // * Ensure aws sns plugin is highlighted
        cy.get('#plugins\\/plugin_com\\.mattermost\\.aws-sns').then((el) => {
            expect(el[0].innerHTML).includes('markjs');
        });

        uninstallAllPlugins();
    });

    it('MM-T1634 - Search box should remain visible / in the header as you scroll down the settings list in the left-hand-side', () => {
        goToAdminConsole();

        // * Scroll to bottom of left hand side
        cy.findByTestId('experimental.bleve').scrollIntoView().click();

        // * To check if the sidebar is in view, try to click it
        cy.get('#adminSidebarFilter').should('be.visible').click();
    });
});
