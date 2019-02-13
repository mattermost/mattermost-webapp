// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Message', () => {
    it('should show only 1 header when user send multiple posts', () => {
        // 1. Login as sysadmin and go to /
        cy.login('sysadmin');
        cy.visit('/');

        // 2. Post a message to force next user message to display a message
        cy.get('#post_textbox').type('Hello').type('{enter}');

        // 3. Login as "user-1" and go to /
        cy.login('user-1');
        cy.visit('/');

        // 4. Post message "One"
        cy.get('#post_textbox').type('One').type('{enter}');

        // * Check profile image is visible
        cy.get('#postListContent > .post.current--user > .post__content > .post__img').last().should('be.visible').find('span > img').should('be.visible');

        // 5. Post message "Two"
        cy.get('#post_textbox').type('Two').type('{enter}');

        // * Check profile image is not visible
        cy.get('#postListContent > .post.current--user > .post__content > .post__img').last().should('be.visible').should('be.empty');

        // 6. Post message "Three"
        cy.get('#post_textbox').type('Three').type('{enter}');

        // * Check profile image is not visible
        cy.get('#postListContent > .post.current--user > .post__content > .post__img').last().should('be.visible').should('be.empty');
    });

    it('M14012 Focus move to main input box when a character key is selected', () => {
        // 1. Login and go to /
        cy.login('user-1');
        cy.visit('/');

        // 2. Left click on any post to move the focus out of the main input box
        cy.get('#post_o55dfx8ooi8azmy83ypgor68ec').click();

        // 3. Push a character key such as "A"
        cy.get('#post_textbox').type('A');

        // 4. Open the "..." menu on a post in the main or reply thread to move the focus out of the main input box
        cy.get('#post_o55dfx8ooi8azmy83ypgor68ec').trigger('mouseover');
        cy.get('#CENTER_dropdown_o55dfx8ooi8azmy83ypgor68ec .dropdown-toggle').click({force: true});

        // 5. Push a character key such as "A"
        cy.get('#post_textbox').type('A');

        // *  Focus is moved back to the main input and the keystroke is captured
        cy.focused().should('have.id', 'post_textbox');
        cy.focused().should('contain', 'AA');
    });
});
