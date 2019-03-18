// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/*eslint max-nested-callbacks: ["error", 3]*/

describe('Post Click-to-Reply (Experimental feature)', () => {
    it('Clicking post body doesn‘t open RHS when click-to-reply is disabled', () => {
        // 1. Login as standard user and go to '/'
        cy.login('user-1');
        cy.visit('/');

        // 2. Post a test message
        cy.postMessage('test for disabled post click');

        // 3. Click on post body, and expect that RHS is closed
        cy.getLastPostId().then(() => {
            cy.get('#rhsContainer').should('not.be.visible');
        });
    });

    it('Clicking post body opens RHS when click-to-reply is enabled', () => {
        // 1. Login as admin and go to experimental settings in admin console
        cy.login('sysadmin');
        cy.visit('/admin_console/advanced/experimental');

        // 2. Enable Click-to-Reply (expect to be disabled by default)
        cy.get(':nth-child(9) > .col-sm-8 > :nth-child(3)').then(($radio) => {
            if ($radio.is.checked) {
                cy.get(':nth-child(9) > .col-sm-8 > :nth-child(2)').click();
                cy.get('#saveSetting').click();
            } else {
                cy.visit('/');
            }
        });

        // 3. Post a test message
        cy.postMessage('test for enabled post click');

        // 4. Click on post body and expect that RHS is open
        cy.getLastPostId().then((postID) => {
            // * RHS should be open
            cy.get(`#postMessageText_${postID}`).click();
            cy.get('#rhsContainer').should('be.visible');
            cy.get('#reply_textbox').type('RHS is open upon clicking post body');

            // * Root post ID should match ID of post clicked
            cy.get(`#RHS_ROOT_time_${postID}`).invoke('attr', 'id').should('eq', `RHS_ROOT_time_${postID}`);
        });
    });

    it('Click on post comment opens RHS when click-to-reply is enabled', () => {
        // 1. Login as standard user and go to '/'
        cy.login('user-1');
        cy.visit('/');

        // 2. Post a test message that will become a thread
        cy.postMessage('test for enabled post click with comments');

        // 3. Post a reply comment on the above post
        cy.clickPostCommentIcon().then(() => {
            cy.get('#reply_textbox').type('comment via reply button {enter}');
            cy.get('#rhsCloseButton').click();
            cy.get('#rhsContainer').should('not.be.visible');
        });

        // 4. Click on post comment and expect that RHS is open
        cy.getLastPostId().then((commentPostID) => {
            // 5. Click on post comment
            cy.get(`#postMessageText_${commentPostID}`).click();

            // * RHS should be open
            cy.get('#rhsContainer').should('be.visible');
            cy.get('#reply_textbox').type('RHS is open upon clicking comment');
        });
    });
});