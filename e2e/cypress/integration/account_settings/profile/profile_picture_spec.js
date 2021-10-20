// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @account_setting

import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('Account Settings > Profile > Profile Picture', () => {
    before(() => {
        cy.apiInitSetup({loginAfter: true}).then(({offTopicUrl}) => {
            cy.visit(offTopicUrl);
        });
    });

    it('MM-T2080 Can remove profile pic', () => {
        const customImageMatch = 'image?_=';

        // * Verify the default profile image is shown first
        cy.uiGetProfileHeader().
            find('.Avatar').
            should('have.attr', 'src').
            and('not.include', customImageMatch);

        // # Go to Account Settings
        cy.uiOpenAccountSettingsModal();

        // # Click "Edit" to the right of "Profile Picture"
        cy.get('#pictureEdit').should('be.visible').click();

        // # Upload and save profile picture
        cy.findByTestId('uploadPicture').attachFile('mattermost-icon.png');
        cy.findByTestId('saveSettingPicture').should('not.be.disabled').click().wait(TIMEOUTS.HALF_SEC);

        // # Close modal
        cy.get('body').type('{esc}');

        // * Profile picture is updated
        cy.uiGetProfileHeader().
            find('.Avatar').
            should('have.attr', 'src').
            and('include', customImageMatch);

        // # Go to Account Settings
        cy.uiOpenAccountSettingsModal();

        // # Click "Edit" to the right of "Profile Picture"
        cy.get('#pictureEdit').should('be.visible').click();

        // # Remove profile picture
        cy.findByTestId('removeSettingPicture').click();
        cy.findByTestId('saveSettingPicture').should('not.be.disabled').click().wait(TIMEOUTS.HALF_SEC);

        // * Check that we are back in the "General" section of the Account Settings
        cy.get('#pictureEdit').should('be.visible');

        // # Close modal
        cy.get('body').type('{esc}');

        // * Verify the default profile image is shown
        cy.uiGetProfileHeader().
            find('.Avatar').
            should('have.attr', 'src').
            and('not.include', customImageMatch);
    });
});
