// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. #. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/**
 * Note: This test requires Enterprise license to be uploaded
 */
import {getRandomInt} from '../../../utils';
import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('Guest Account - Guest User Invitation Flow', () => {
    before(() => {
        // # Enable Guest Account Settings
        cy.apiUpdateConfig({
            GuestAccountsSettings: {
                Enable: true,
            },
        });

        // # Login as "sysadmin" and go to /
        cy.apiLogin('sysadmin');
        cy.visit('/');
    });

    it('MM-18041 Verify UI Elements of Guest User Invitation Flow', () => {
        // #Open Invite People
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('#invitePeople').should('be.visible').click();

        // *Verify Invite Guest link
        cy.getByTestId('inviteGuestLink').should('be.visible').within(($el) => {
            cy.wrap($el).find('h2 > span').should('have.text', 'Invite Guests');
            cy.wrap($el).find('div > span').should('have.text', 'Invite guests to one or more channels. Guests only have access to messages, files, and people in the channels they are members of.');
            cy.wrap($el).find('.arrow').click();
        });

        // * Verify the header has changed in the modal
        cy.getByTestId('invitationModal').within(($el) => {
            cy.wrap($el).find('h1').should('have.text', 'Invite Guests');
        });

        // *Verify Invite Guests button is disabled by default
        cy.get('#inviteGuestButton').scrollIntoView().should('be.visible').and('be.disabled');

        // *Verify Invite People field
        const email = `temp-${getRandomInt(9999).toString()}@mattermost.com`;
        cy.getByTestId('addPeople').should('be.visible').within(($el) => {
            cy.wrap($el).find('h2 > span').should('have.text', 'Invite People');
            cy.wrap($el).find('.help-text > span').should('have.text', 'Search and add guests or email invite new users.');
        });
        cy.getByTestId('emailPlaceholder').should('be.visible').within(($el) => {
            // * Verify the input placeholder text
            cy.wrap($el).get('.users-emails-input__placeholder').should('have.text', 'Add guests or email addresses');

            // # Type the email of the new user
            cy.wrap($el).get('input').type(email, {force: true});
            cy.wrap($el).get('.users-emails-input__menu').
                children().should('have.length', 1).
                eq(0).should('contain', `Invite ${email} as a guest`).click();
        });

        // *Verify Search and Add Channels
        cy.getByTestId('channelPlaceholder').should('be.visible').within(($el) => {
            cy.wrap($el).find('h2 > span').should('have.text', 'Search and Add Channels');
            cy.wrap($el).find('.help-text > span').should('have.text', 'Specify the channels the guests have access to.');
        });
        cy.getByTestId('channelPlaceholder').should('be.visible').within(($el) => {
            // * Verify the input placeholder text
            cy.wrap($el).get('.channels-input__placeholder').should('have.text', 'Search and add channels');

            // # Type the channel name
            cy.wrap($el).get('input').type('town sq', {force: true});
            cy.wrap($el).get('.channels-input__menu').
                children().should('have.length', 1).
                eq(0).should('contain', 'Town Square').click();
        });

        // *Verify Set Custom Message before clicking on the link
        cy.getByTestId('customMessage').should('be.visible').within(($el) => {
            cy.wrap($el).get('#customMessageHeader').should('not.exist');
            cy.wrap($el).get('textarea').should('not.exist');
            cy.wrap($el).get('.help-text').should('have.text', 'Create a custom message to make your invite more personal.');

            // #Verify link text and click on it
            cy.wrap($el).get('a').should('have.text', 'Set a custom message').click();
        });

        // *Verify Set Custom Message after clicking on the link
        cy.getByTestId('customMessage').should('be.visible').within(($el) => {
            cy.wrap($el).get('a').should('not.exist');
            cy.wrap($el).find('div > span').first().should('be.visible').and('have.text', 'Custom message');
            cy.wrap($el).get('textarea').should('be.visible');
            cy.wrap($el).get('.help-text').should('have.text', 'Create a custom message to make your invite more personal.');
        });

        // * Verify the confirmation message when users clicks on the Close button
        cy.get('#closeIcon').should('be.visible').click();
        cy.get('#confirmModalLabel').should('be.visible').and('have.text', 'Discard Changes');
        cy.get('.modal-body').should('be.visible').and('have.text', 'You have unsent invitations, are you sure you want to discard them?');

        // * Verify the behavior when Cancel button in the confirmation message is clicked
        cy.get('#cancelModalButton').click();
        cy.get('#confirmModal').should('not.exist');

        // * Verify the confirmation message when users clicks on the Previous button
        cy.get('#backIcon').should('be.visible').click();
        cy.get('#confirmModalLabel').should('be.visible').and('have.text', 'Discard Changes');
        cy.get('.modal-body').should('be.visible').and('have.text', 'You have unsent invitations, are you sure you want to discard them?');

        // * Verify the behavior when Yes, Discard button in the confirmation message is clicked
        cy.get('#confirmModalButton').should('be.visible').and('have.text', 'Yes, Discard').click().wait(TIMEOUTS.TINY);

        // * Verify it goes back to previous step since back button was pressed
        cy.getByTestId('inviteGuestLink').should('be.visible');
    });
});
