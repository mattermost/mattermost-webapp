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

const checkBoxes = ['create_post-guests', 'create_post-members', 'create_reactions-members', 'create_reactions-guests', 'manage_members-members', 'use_channel_mentions-members', 'use_channel_mentions-guests'];

const disableAllChannelModeratedPermissions = () => {
    checkBoxes.forEach((buttonId) => {
        cy.findByTestId(buttonId).then((btn) => {
            if (btn.hasClass('checked')) {
                btn.click();
            }
        });
    });
};

const enableAllChannelModeratedPermissions = () => {
    checkBoxes.forEach((buttonId) => {
        cy.findByTestId(buttonId).then((btn) => {
            if (!btn.hasClass('checked')) {
                btn.click();
            }
        });
    });
};

describe('Channel Moderation Test', () => {
    before(() => {
        // * Check if server has license
        cy.requireLicense();

        // Reset permissions in system scheme to defaults.
        cy.apiLogin('sysadmin');
        cy.visit('/admin_console/user_management/permissions/system_scheme');
        cy.findByTestId('resetPermissionsToDefault').click();
        cy.get('#confirmModalButton').click();
        cy.get('#saveSetting').click();
        waitUntilConfigSave();
    });

    it('MM-22276 - Enable and Disable all channel moderated permissions', () => {
        const channelName = 'autem';

        // # Go to system admin page and to channel configuration page of channel "autem"
        cy.visit('/admin_console/user_management/channels');

        // # Search for the channel.
        cy.findByTestId('search-input').type(`${channelName}{enter}`);
        cy.findByTestId(`${channelName}edit`).click();

        // # Wait until the groups retrieved and show up
        cy.wait(1000); //eslint-disable-line cypress/no-unnecessary-waiting

        // # Check all the boxes currently unchecked (align with the system scheme permissions)
        enableAllChannelModeratedPermissions();

        // # Save if possible (if previous test ended abruptly all permissions may already be enabled)
        cy.get('#saveSetting').then((btn) => {
            if (!btn.disabled) {
                btn.click();
            }
        });
        waitUntilConfigSave();

        // # Reload to ensure it's been saved
        cy.reload();

        // # Wait until the groups retrieved and show up
        cy.wait(1000); //eslint-disable-line cypress/no-unnecessary-waiting

        // * Ensure all checkboxes are checked
        checkBoxes.forEach((buttonId) => {
            cy.findByTestId(buttonId).should('have.class', 'checked');
        });

        // # Uncheck all the boxes currently checked
        disableAllChannelModeratedPermissions();

        // # Save the page and wait till saving is done
        cy.get('#saveSetting').click();
        waitUntilConfigSave();

        // # Reload to ensure it's been saved
        cy.reload();

        // # Wait until the groups retrieved and show up
        cy.wait(1000); //eslint-disable-line cypress/no-unnecessary-waiting

        // * Ensure all checkboxes have the correct unchecked state
        checkBoxes.forEach((buttonId) => {
            // * Ensure all checkboxes are unchecked
            cy.findByTestId(buttonId).should('not.have.class', 'checked');

            // * Ensure Channel Mentions are disabled due to Create Posts
            if (buttonId.includes('use_channel_mentions')) {
                cy.findByTestId(buttonId).should('be.disabled');
                return;
            }

            // * Ensure all other check boxes are still enabled
            cy.findByTestId(buttonId).should('not.be.disabled');
        });
    });
});
