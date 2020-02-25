// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

const waitUntilConfigSave = () => {
    cy.waitUntil(() => cy.get('#saveSetting').then((el) => {
        return el[0].innerText === 'Save';
    }));
};

describe('Channel Moderation Test', () => {
    before(() => {
        // Reset permissions in system scheme to defaults.
        cy.apiLogin('sysadmin');
        cy.visit('/admin_console/user_management/permissions/system_scheme');
        cy.findByTestId('resetPermissionsToDefault').click();
        cy.get('#confirmModalButton').click();
        cy.get('#saveSetting').click();
        waitUntilConfigSave();
    });

    it('MM-21789 - Add a group and change the role and then save and ensure the role was updated on channel configuration page', () => {
        const channelName = 'autem';

        // # Go to system admin page and to channel configuration page of channel "autem"
        cy.visit('/admin_console/user_management/channels');

        // # Search for the channel.
        cy.findByTestId('search-input').type(`${channelName}{enter}`);
        cy.findByTestId(`${channelName}edit`).click();

        // # Wait until the groups retrieved and show up
        cy.wait(500); //eslint-disable-line cypress/no-unnecessary-waiting

        // # Uncheck all the boxes currently checked (align with the system scheme permissions)
        cy.findByTestId('create_post-guests').click();
        cy.findByTestId('create_post-members').click();
        cy.findByTestId('create_reactions-members').click();
        cy.findByTestId('manage_members-members').click();
        cy.get('#saveSetting').click();
        waitUntilConfigSave();

        // # Reload to ensure it's been saved
        cy.reload();

        // # Wait until the groups retrieved and show up
        cy.wait(500); //eslint-disable-line cypress/no-unnecessary-waiting

        // * Asset and make sure that the classes do not have class of checked (Create Posts, Post Reactions Members, Manage Members Members)
        cy.findByTestId('create_post-members').should('not.have.class', 'checked');
        cy.findByTestId('create_reactions-members').should('not.have.class', 'checked');
        cy.findByTestId('manage_members-members').should('not.have.class', 'checked');

        // * Ensure the Post Reacts checkbox for guests is disabled
        cy.findByTestId('create_reactions-guests').should('have.class', 'disabled');
        cy.findByTestId('create_reactions-guests').should('be.disabled');

        // * Ensure the channel mentions checkboxes for both members and guests is disabled
        cy.findByTestId('use_channel_mentions-guests').should('have.class', 'disabled');
        cy.findByTestId('use_channel_mentions-guests').should('be.disabled');
        cy.findByTestId('use_channel_mentions-members').should('have.class', 'disabled');
        cy.findByTestId('use_channel_mentions-members').should('be.disabled');
    });
});
