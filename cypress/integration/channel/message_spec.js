// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/*eslint max-nested-callbacks: ["error", 3]*/

describe('Message', () => {
    it('M13701 Consecutive message does not repeat profile info', () => {
        // 1. Login as sysadmin and go to /
        cy.login('sysadmin');
        cy.visit('/');

        // 2. Post a message to force next user message to display a message
        cy.postMessage('Hello');

        // 3. Login as "user-1" and go to /
        cy.login('user-1');
        cy.visit('/');

        // 4. Post message "One"
        cy.postMessage('One');

        // * Check profile image is visible
        cy.get('#postListContent > .post.current--user > .post__content > .post__img').last().should('be.visible').find('span > img').should('be.visible');

        // 5. Post message "Two"
        cy.postMessage('Two');

        // * Check profile image is not visible
        cy.get('#postListContent > .post.current--user > .post__content > .post__img').last().should('be.visible').should('be.empty');

        // 6. Post message "Three"
        cy.postMessage('Three');

        // * Check profile image is not visible
        cy.get('#postListContent > .post.current--user > .post__content > .post__img').last().should('be.visible').should('be.empty');
    });

    it('M14012 Focus move to main input box when a character key is selected', () => {
        // 1. Login and go to /
        cy.login('user-1');
        cy.visit('/');

        // 2. Post message
        cy.postMessage('Message');

        cy.getLastPostId().then((postId) => {
            const divPostId = `#post_${postId}`;

            // 3. Left click on post to move the focus out of the main input box
            cy.get(divPostId).click();

            // 4. Push a character key such as "A"
            cy.get('#post_textbox').type('A');

            // 5. Open the "..." menu on a post in the main to move the focus out of the main input box
            cy.get(divPostId).trigger('mouseover');
            cy.get(`#CENTER_dropdown_${postId} .dropdown-toggle`).click({force: true});

            // 6. Push a character key such as "A"
            cy.get('#post_textbox').type('A');

            // *  Focus is moved back to the main input and the keystroke is captured
            cy.focused().should('have.id', 'post_textbox');
            cy.focused().should('contain', 'AA');
        });
    });

    it('M14320 @here., @all. and @channel. (ending in a period) still highlight', () => {
        // 1. Login and go to /
        cy.login('user-1');
        cy.visit('/');

        // 2. Post message
        cy.postMessage('@here. @all. @channel.');

        // * Check that confirm modal is displayed
        cy.get('#confirmModal').should('be.visible');

        // 3. Confirm multiple mentions
        cy.get('#confirmModalButton').click();

        // * Check that confirm modal is closed
        cy.get('#confirmModal').should('not.be.visible');

        // 4 Waiting create post is done
        cy.wait(500); // eslint-disable-line

        cy.getLastPostId().then((postId) => {
            const divPostId = `#postMessageText_${postId}`;

            // * Check that the message contains the whole content sent ie. mentions with dots.
            cy.get(divPostId).find('p').should('have', '@here. @all. @channel.');

            // * Check that only the at-mention are inside span.mention--highlight
            cy.get(divPostId).find('.mention--highlight').
                first().should('have', '@here').should('not.have', '.').
                next().should('have', '@all').should('not.have', '.').
                next().should('have', '@channel').should('not.have', '.');
        });
    });
});
