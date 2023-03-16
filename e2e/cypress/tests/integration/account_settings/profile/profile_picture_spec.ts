// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @account_setting

// TODO: Remove import once e2e/cypress/tests/support/index.ts is converted to Typescript.
import 'cypress-file-upload';

import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('Profile > Profile Settings > Profile Picture', () => {
    beforeEach(() => {
        cy.apiAdminLogin().apiInitSetup({loginAfter: true}).then(({offTopicUrl}) => {
            cy.visit(offTopicUrl);
        });
    });

    it('MM-T2080 Can remove profile pic', () => {
        // * Verify the default profile image is shown first
        verifyDefaultProfilePictureIsSet();

        // # Go to Profile
        cy.uiOpenProfileModal();

        // # Click "Edit" to the right of "Profile Picture"
        cy.get('#pictureEdit').should('be.visible').click();

        // # Upload and save profile picture
        cy.findByTestId('uploadPicture').attachFile('mattermost-icon.png');
        cy.uiSave().wait(TIMEOUTS.HALF_SEC);

        // # Close modal
        cy.get('body').type('{esc}');

        // * Profile picture is updated
        verifyCustomProfilePictureIsSet();

        // # Go to Profile
        cy.uiOpenProfileModal();

        // # Click "Edit" to the right of "Profile Picture"
        cy.get('#pictureEdit').should('be.visible').click();

        // # Remove profile picture
        cy.findByTestId('removeSettingPicture').click();
        cy.uiSave().wait(TIMEOUTS.HALF_SEC);

        // * Check that we are back in the "General" section of the Profile
        cy.get('#pictureEdit').should('be.visible');

        // # Close modal
        cy.get('body').type('{esc}');

        // * Verify the default profile image is shown
        verifyDefaultProfilePictureIsSet();
    });

    it('MM-T2077 Profile picture: non image file shows error', () => {
        // # Go to Profile
        cy.uiOpenProfileModal();

        // # Click "Edit" to the right of "Profile Picture"
        cy.get('#pictureEdit').should('be.visible').click();

        // # Upload and save profile picture
        cy.findByTestId('uploadPicture').attachFile('txt-changed-as-png.png');
        cy.uiSave().wait(TIMEOUTS.HALF_SEC);

        // # Verify error message
        cy.get('.has-error').
            should('be.visible').
            and('contain', 'Image limits check failed. Resolution is too high.');
    });

    it('MM-T2078 Profile picture: file type PNG accepted', () => {
        verifyPictureIsAccepted('png-image-file.png');
    });

    it('MM-T2078 Profile picture: file type JPG accepted', () => {
        verifyPictureIsAccepted('jpg-image-file.jpg');
    });

    it('MM-T2078 Profile picture: file type JPEG accepted', () => {
        verifyPictureIsAccepted('jpeg-image-file.jpeg');
    });

    it('MM-T2078 Profile picture: file type BMP accepted', () => {
        verifyPictureIsAccepted('bmp-image-file.bmp');
    });
});

const customImageMatch = 'image?_=';

function verifyDefaultProfilePictureIsSet() {
    cy.uiGetProfileHeader().
        find('.Avatar').
        should('have.attr', 'src').
        and('not.include', customImageMatch);
}

function verifyCustomProfilePictureIsSet() {
    cy.uiGetProfileHeader().
        find('.Avatar').
        should('have.attr', 'src').
        and('include', customImageMatch);
}

function verifyPictureIsAccepted(fileName: string) {
    // * Verify the default profile image is shown first
    verifyDefaultProfilePictureIsSet();

    // # Open Profile > Profile Settings > Profile Picture > Edit
    cy.uiOpenProfileModal().findByRole('button', {name: /picture edit/i}).click();

    // # Select a new profile picture and click Save
    cy.findByTestId('uploadPicture').attachFile(fileName);
    cy.uiSave().wait(TIMEOUTS.HALF_SEC);

    // # Close modal
    cy.get('body').type('{esc}');

    // * Profile picture is updated
    verifyCustomProfilePictureIsSet();
}
