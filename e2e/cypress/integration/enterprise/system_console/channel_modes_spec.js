// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Test channel public/private toggle', () => {
    before(() => {
        // Enable LDAP and LDAP group sync
        cy.apiUpdateConfig({
            LdapSettings: {Enable: true},
        });
    });

    it('Verify that System Admin can change channel privacy using toggle', () => {
        cy.apiLogin('sysadmin');
        cy.visit('/');
        cy.getCurrentTeamId().then((teamId) => {
            return cy.apiCreateChannel(teamId, 'test-channel', 'Test Channel');
        }).then((res) => {
            const channel = res.body;
            assert(channel.type === 'O');
            cy.visit(`/admin_console/user_management/channels/${channel.id}`);
            cy.get('#channel_profile').contains(channel.display_name);
            cy.get('#channel_manage .group-teams-and-channels--body').find('button').eq(1).click();
            cy.get('#saveSetting').click();
            cy.get('#confirmModalButton').click();
            return cy.apiGetChannel(channel.id);
        }).then((res) => {
            const channel = res.body;
            assert(channel.type === 'P');
            cy.visit(`/admin_console/user_management/channels/${channel.id}`);
            cy.get('#channel_profile').contains(channel.display_name);
            cy.get('#channel_manage .group-teams-and-channels--body').find('button').eq(1).click();
            cy.get('#saveSetting').click();
            cy.get('#confirmModalButton').click();
            return cy.apiGetChannel(channel.id);
        }).then((res) => {
            const channel = res.body;
            assert(channel.type === 'O');
        });
    });

    it('Verify that resetting sync toggle doesn\'t alter channel privacy toggle', () => {
        cy.apiLogin('sysadmin');
        cy.visit('/');
        cy.getCurrentTeamId().then((teamId) => {
            return cy.apiCreateChannel(teamId, 'test-channel', 'Test Channel');
        }).then((res) => {
            const channel = res.body;
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
        cy.apiLogin('sysadmin');
        cy.visit('/');
        cy.get('#sidebarItem_town-square').scrollIntoView().click({force: true});
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
