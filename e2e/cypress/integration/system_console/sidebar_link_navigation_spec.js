// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('System Console', () => {
    before(() => {
        const newSettings = {
            TeamSettings: {SiteName: 'Mattermost'},
        };
        cy.apiUpdateConfig(newSettings);

        // # Login as System Admin
        cy.apiLogin('sysadmin');

        cy.visit('/');
    });

    it('can go to admin console by clicking System Console', () => {
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();

        cy.get('.Menu__content').should('be.visible').within(() => {
            cy.findByText('System Console').should('be.visible').click();
        });

        cy.url().should('include', '/admin_console/about/license');
    });

    const testCases = [
        {
            header: 'Edition and License',
            sidebar: 'Edition and License',
            url: 'admin_console/about/license',
            otherUrl: 'admin_console/reporting/system_analytics',
        },
        {
            header: 'System Statistics',
            sidebar: 'Site Statistics',
            url: '/admin_console/reporting/system_analytics',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Team Statistics',
            sidebar: 'Team Statistics',
            url: '/admin_console/reporting/team_statistics',
            otherUrl: 'admin_console/about/license',
            headerContains: true,
        },
        {
            header: 'Server Logs',
            sidebar: 'Server Logs',
            url: 'admin_console/reporting/server_logs',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Mattermost Users',
            sidebar: 'Users',
            url: 'admin_console/user_management/users',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Web Server',
            sidebar: 'Web Server',
            url: 'admin_console/environment/web_server',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Database',
            sidebar: 'Database',
            url: 'admin_console/environment/database',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'File Storage',
            sidebar: 'File Storage',
            url: 'admin_console/environment/file_storage',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Image Proxy',
            sidebar: 'Image Proxy',
            url: 'admin_console/environment/image_proxy',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'SMTP',
            sidebar: 'SMTP',
            url: 'admin_console/environment/smtp',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Push Notification Server',
            sidebar: 'Push Notification Server',
            url: 'admin_console/environment/push_notification_server',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Rate Limiting',
            sidebar: 'Rate Limiting',
            url: 'admin_console/environment/rate_limiting',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Logging',
            sidebar: 'Logging',
            url: 'admin_console/environment/logging',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Session Lengths',
            sidebar: 'Session Lengths',
            url: 'admin_console/environment/session_lengths',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Developer Settings',
            sidebar: 'Developer',
            url: 'admin_console/environment/developer',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Customization',
            sidebar: 'Customization',
            url: 'admin_console/site_config/customization',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Localization',
            sidebar: 'Localization',
            url: 'admin_console/site_config/localization',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Users and Teams',
            sidebar: 'Users and Teams',
            url: 'admin_console/site_config/users_and_teams',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Notifications',
            sidebar: 'Notifications',
            url: 'admin_console/environment/notifications',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Emoji',
            sidebar: 'Emoji',
            url: 'admin_console/site_config/emoji',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Posts',
            sidebar: 'Posts',
            url: 'admin_console/site_config/posts',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'File Sharing and Downloads',
            sidebar: 'File Sharing and Downloads',
            url: 'admin_console/site_config/file_sharing_downloads',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Public Links',
            sidebar: 'Public Links',
            url: 'admin_console/site_config/public_links',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Signup',
            sidebar: 'Signup',
            url: 'admin_console/authentication/signup',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Email Authentication',
            sidebar: 'Email',
            url: 'admin_console/authentication/email',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Password',
            sidebar: 'Password',
            url: 'admin_console/authentication/password',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Multi-factor Authentication',
            sidebar: 'MFA',
            url: 'admin_console/authentication/mfa',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Plugin Management',
            sidebar: 'Plugin Management',
            url: 'admin_console/plugins/plugin_management',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Integration Management',
            sidebar: 'Integration Management',
            url: 'admin_console/integrations/integration_management',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Bot Accounts',
            sidebar: 'Bot Accounts',
            url: 'admin_console/integrations/bot_accounts',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'GIF (Beta)',
            sidebar: 'GIF (Beta)',
            url: 'admin_console/integrations/gif',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'CORS',
            sidebar: 'CORS',
            url: 'admin_console/integrations/cors',
            otherUrl: 'admin_console/about/license',
        },
        {
            header: 'Experimental Features',
            sidebar: 'Features',
            url: 'admin_console/experimental/features',
            otherUrl: 'admin_console/about/license',
        },
    ];

    testCases.forEach((testCase) => {
        it(`can navigate to ${testCase.header}`, () => {
            // # Visit the URL directly
            cy.visit(testCase.url);

            // * Verify that the header is correct
            cy.get('.admin-console').should('be.visible').within(() => {
                cy.get('.admin-console__header').should('be.visible').and(testCase.headerContains ? 'contain' : 'have.text', testCase.header);
            });

            // # Visit other URL and click the link on the sidebar
            cy.visit(testCase.otherUrl);
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
});
