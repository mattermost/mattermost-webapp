// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Messaging', () => {
    before(() => {
        // # Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('M17443 - Terms that are not valid emojis render as plain text', () => {
        // # Post message to use
        cy.postMessage(':pickle:');

        // * Post contains the text
        cy.getLastPost().should('contain', ':pickle:');

        // # Post message to use
        cy.postMessage('on Mon Jun 03 16:15:11 +0000 2019');

        // * Post contains the text
        cy.getLastPost().should('contain', 'on Mon Jun 03 16:15:11 +0000 2019');
    });
});
