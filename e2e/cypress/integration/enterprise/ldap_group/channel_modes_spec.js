// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @enterprise @ldap_group

describe('Test channel public/private toggle', () => {
    let testTeam;

    before(() => {
        // * Check if server has license for LDAP Groups
        cy.apiRequireLicenseForFeature('LDAPGroups');

        // Enable LDAP and LDAP group sync
        cy.apiUpdateConfig({
            LdapSettings: {
                Enable: true,
                EnableSync: true,
            },
        });

        // # Check and run LDAP Sync job
        if (Cypress.env('runLDAPSync')) {
            cy.checkRunLDAPSync();
        }

        // # Init test setup
        cy.apiInitSetup().then(({team}) => {
            testTeam = team;
        });
    });

    it('Verify that System Admin can change channel privacy using toggle', () => {
        cy.apiCreateChannel(testTeam.id, 'test-channel', 'Test Channel').then(({channel}) => {
            assert(channel.type === 'O');
            cy.visit(`/admin_console/user_management/channels/${channel.id}`);
            cy.get('#channel_profile').contains(channel.display_name);
            cy.get('#channel_manage .group-teams-and-channels--body').find('button').eq(1).click();
            cy.get('#saveSetting').click();
            cy.get('#confirmModalButton').click();
            return cy.apiGetChannel(channel.id);
        }).then(({channel}) => {
            assert(channel.type === 'P');
            cy.visit(`/admin_console/user_management/channels/${channel.id}`);
            cy.get('#channel_profile').contains(channel.display_name);
            cy.get('#channel_manage .group-teams-and-channels--body').find('button').eq(1).click();
            cy.get('#saveSetting').click();
            cy.get('#confirmModalButton').click();
            return cy.apiGetChannel(channel.id);
        }).then(({channel}) => {
            assert(channel.type === 'O');
        });
    });

    it('Verify that resetting sync toggle doesn\'t alter channel privacy toggle', () => {
        cy.apiCreateChannel(testTeam.id, 'test-channel', 'Test Channel').then(({channel}) => {
            assert(channel.type === 'O');
            cy.visit(`/admin_console/user_management/channels/${channel.id}`);
            cy.get('#channel_profile').contains(channel.display_name);
            cy.get('#channel_manage .group-teams-and-channels--body').find('button').eq(0).click();
            cy.get('#channel_manage .group-teams-and-channels--body').find('button').eq(0).click();
            cy.get('#channel_manage .group-teams-and-channels--body').find('button').eq(1).contains('Public');
            cy.get('#channel_manage .group-teams-and-channels--body').find('button').eq(1).click();
            cy.get('#channel_manage .group-teams-and-channels--body').find('button').eq(0).click();
            cy.get('#channel_manage .group-teams-and-channels--body').find('button').eq(0).click();
            cy.get('#channel_manage .group-teams-and-channels--body').find('button').eq(1).contains('Private');
        });
    });

    it('Verify that toggles are disabled for default channel', () => {
        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.getCurrentChannelId().then((id) => {
            cy.visit(`/admin_console/user_management/channels/${id}`);
            cy.get('#channel_profile').contains('Town Square');
            cy.get('#channel_manage .group-teams-and-channels--body').find('button').eq(0).should('have.class', 'false');
            cy.get('#channel_manage .group-teams-and-channels--body').find('button').eq(1).contains('Public');
            cy.get('#channel_manage .group-teams-and-channels--body').find('button').eq(0).should('have.class', 'disabled');
            cy.get('#channel_manage .group-teams-and-channels--body').find('button').eq(1).should('have.class', 'disabled');
        });
    });
});
