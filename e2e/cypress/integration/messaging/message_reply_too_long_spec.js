// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

describe('Message Reply too long', () => {
    before(() => {
        // # Login as test user and visit town-square channel
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);

            // # Post a new message to ensure there will be a post to click on
            cy.postMessage('Hello ' + Date.now());
        });
    });

    it('MM-T106 Webapp: "Message too long" warning text', () => {
        // # Click "Reply"
        cy.getLastPostId().then((postId) => {
            cy.clickPostCommentIcon(postId);
        });

        // # Enter valid text into RHS
        const replyValid = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ';
        cy.get('#reply_textbox').clear().should('be.visible').type(replyValid).type('{enter}');

        // * Check no warning
        cy.get('.post-error').should('not.exist');

        // # Enter too long text into RHS
        const maxReplyLength = 16383;
        const replyTooLong = replyValid.repeat((maxReplyLength / replyValid.length) + 1);
        cy.get('#reply_textbox').invoke('val', replyTooLong).trigger('input');

        // * Check warning doesn't overlap textbox
        cy.get('.post-error').should('be.visible');
        cy.get('#reply_textbox').should('be.visible');

        // # Type "enter" into RHS
        cy.get('#reply_textbox').type('{enter}');

        // * Check warning
        cy.get('.post-error').should('be.visible').and('have.class', 'animation--highlight').and('have.text', `Your message is too long. Character count: ${replyTooLong.length}/${maxReplyLength}`);
        cy.get('#reply_textbox').should('be.visible');

        // * Check last reply is the last valid one
        cy.getLastPostId().then((replyId) => {
            cy.get(`#postMessageText_${replyId}`).should('be.visible').and('have.text', replyValid);
        });
    });
});
