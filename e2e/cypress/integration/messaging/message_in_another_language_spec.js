// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Messaging', () => {
    before(() => {
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('M17456 - Message in another language should be displayed properly', () => {
        const msg = '안녕하세요';

        // # Make a post
        cy.postMessage(msg);

        // * Check that last message do contain right message
        cy.getLastPost().should('have', '안녕하세요');

        // # Mouseover the post and click post comment icon.
        cy.clickPostCommentIcon();

        // # Post a reply in RHS.
        cy.postMessageReplyInRHS('닥터 카레브');

        // * Check that last message do contain right message
        cy.getLastPost().should('have', '닥터 카레브');

    });
});
