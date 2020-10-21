// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @system_console

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('System Console - Non-Enterprise', () => {
    const testCases = [
        {
            header: 'Edition and License',
            sidebar: 'Edition and License',
            url: 'admin_console/about/license',
        },
        {
            header: 'System Statistics',
            sidebar: 'Site Statistics',
            url: '/admin_console/reporting/system_analytics',
        },
        {
            header: 'Team Statistics',
            sidebar: 'Team Statistics',
            url: '/admin_console/reporting/team_statistics',
            headerContains: true,
        },
        {
            header: 'Server Logs',
            sidebar: 'Server Logs',
            url: 'admin_console/reporting/server_logs',
        },
        {
            header: 'Mattermost Users',
            sidebar: 'Users',
            url: 'admin_console/user_management/users',
        },
        {
            header: 'Web Server',
            sidebar: 'Web Server',
            url: 'admin_console/environment/web_server',
        },
        {
            header: 'Database',
            sidebar: 'Database',
            url: 'admin_console/environment/database',
        },
        {
            header: 'File Storage',
            sidebar: 'File Storage',
            url: 'admin_console/environment/file_storage',
        },
        {
            header: 'Image Proxy',
            sidebar: 'Image Proxy',
            url: 'admin_console/environment/image_proxy',
        },
        {
            header: 'SMTP',
            sidebar: 'SMTP',
            url: 'admin_console/environment/smtp',
        },
        {
            header: 'Push Notification Server',
            sidebar: 'Push Notification Server',
            url: 'admin_console/environment/push_notification_server',
        },
        {
            header: 'Rate Limiting',
            sidebar: 'Rate Limiting',
            url: 'admin_console/environment/rate_limiting',
        },
        {
            header: 'Logging',
            sidebar: 'Logging',
            url: 'admin_console/environment/logging',
        },
        {
            header: 'Session Lengths',
            sidebar: 'Session Lengths',
            url: 'admin_console/environment/session_lengths',
        },
        {
            header: 'Developer Settings',
            sidebar: 'Developer',
            url: 'admin_console/environment/developer',
        },
        {
            header: 'Customization',
            sidebar: 'Customization',
            url: 'admin_console/site_config/customization',
        },
        {
            header: 'Localization',
            sidebar: 'Localization',
            url: 'admin_console/site_config/localization',
        },
        {
            header: 'Users and Teams',
            sidebar: 'Users and Teams',
            url: 'admin_console/site_config/users_and_teams',
        },
        {
            header: 'Notifications',
            sidebar: 'Notifications',
            url: 'admin_console/environment/notifications',
        },
        {
            header: 'Emoji',
            sidebar: 'Emoji',
            url: 'admin_console/site_config/emoji',
        },
        {
            header: 'Posts',
            sidebar: 'Posts',
            url: 'admin_console/site_config/posts',
        },
        {
            header: 'File Sharing and Downloads',
            sidebar: 'File Sharing and Downloads',
            url: 'admin_console/site_config/file_sharing_downloads',
        },
        {
            header: 'Public Links',
            sidebar: 'Public Links',
            url: 'admin_console/site_config/public_links',
        },
        {
            header: 'Signup',
            sidebar: 'Signup',
            url: 'admin_console/authentication/signup',
        },
        {
            header: 'Email Authentication',
            sidebar: 'Email',
            url: 'admin_console/authentication/email',
        },
        {
            header: 'Password',
            sidebar: 'Password',
            url: 'admin_console/authentication/password',
        },
        {
            header: 'Multi-factor Authentication',
            sidebar: 'MFA',
            url: 'admin_console/authentication/mfa',
        },
        {
            header: 'Plugin Management',
            sidebar: 'Plugin Management',
            url: 'admin_console/plugins/plugin_management',
        },
        {
            header: 'Integration Management',
            sidebar: 'Integration Management',
            url: 'admin_console/integrations/integration_management',
        },
        {
            header: 'Bot Accounts',
            sidebar: 'Bot Accounts',
            url: 'admin_console/integrations/bot_accounts',
        },
        {
            header: 'GIF (Beta)',
            sidebar: 'GIF (Beta)',
            url: 'admin_console/integrations/gif',
        },
        {
            header: 'CORS',
            sidebar: 'CORS',
            url: 'admin_console/integrations/cors',
        },
        {
            header: 'Experimental Features',
            sidebar: 'Features',
            url: 'admin_console/experimental/features',
        },
    ];

    before(() => {
        const newSettings = {
            TeamSettings: {SiteName: 'Mattermost'},
        };
        cy.apiUpdateConfig(newSettings);

        // # Go to system admin then verify admin console URL and header
        cy.visit('/admin_console/about/license');
        cy.url().should('include', '/admin_console/about/license');
        cy.get('.admin-console', {timeout: TIMEOUTS.HALF_MIN}).should('be.visible').within(() => {
            cy.get('.admin-console__header').should('be.visible').and('have.text', 'Edition and License');
        });
    });

    beforeEach(() => {
        // # Click on "Edition and License"
        cy.get('.admin-sidebar').should('be.visible').within(() => {
            cy.findByText('Edition and License').scrollIntoView().should('be.visible').click();
        });

        // * Verify that it redirects to the URL and matches with the header
        cy.url().should('include', '/admin_console/about/license');
        cy.get('.admin-console').should('be.visible').within(() => {
            cy.get('.admin-console__header').should('be.visible').and('have.text', 'Edition and License');
        });
    });

    testCases.forEach((testCase) => {
        it(`can navigate to ${testCase.header}`, () => {
            // # Click the link on the sidebar
            cy.get('.admin-sidebar').should('be.visible').within(() => {
                cy.findByText(testCase.sidebar).scrollIntoView().should('be.visible').click();
            });

            // * Verify that it redirects to the URL and matches with the header
            cy.url().should('include', testCase.url);
            cy.get('.admin-console').should('be.visible').within(() => {
                cy.get('.admin-console__header').should('be.visible').and(testCase.headerContains ? 'contain' : 'have.text', testCase.header);
            });
        });
    });

    it('can go to admin console by clicking System Console', () => {
        // # Go to default team/channel
        cy.visit('/');

        // # Click on "Main Menu"
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();

        // # Click on "System Console"
        cy.get('.Menu__content').should('be.visible').within(() => {
            cy.findByText('System Console').should('be.visible').click();
        });

        // * Verify that it redirects to "Edition and License" system console page
        cy.url().should('include', '/admin_console/about/license');
        cy.get('.admin-console').should('be.visible').within(() => {
            cy.get('.admin-console__header').should('be.visible').and('have.text', 'Edition and License');
        });
    });
});
