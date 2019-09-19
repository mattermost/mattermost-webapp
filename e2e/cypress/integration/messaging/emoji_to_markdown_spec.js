// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

function createMessages(message, aliases) {
    cy.postMessage(message);
    cy.getLastPostId().then((postId) => {
        cy.get(`#postMessageText_${postId}`).as(aliases[0]);
        cy.clickPostCommentIcon(postId);
    });

    cy.postMessageReplyInRHS(message + '{enter}');
    cy.getLastPostId().then((postId) => {
        cy.get(`#postMessageText_${postId}`).as(aliases[1]);
    });
}

function createAndVerifyMessage(message, isCode) {
    const aliases = ['newLineMessage', 'aliasLineMessageReplyInRHS'];
    createMessages(message, aliases);

    if (isCode) {
        aliases.forEach((alias) => {
            cy.get('@' + alias).
                children().should('have.class', 'post-code').
                children('code').should('be.visible').contains(message.trim());
        });
    } else {
        aliases.forEach((alias) => {
            cy.get('@' + alias).
                children().should('have.class', 'all-emoji').
                children().find('span').last().should('have.class', 'emoticon').
                and('have.attr', 'title', message.trim() === ':D' ? ':smile:' : ':taco:');
        });
    }
}

describe('Messaging', () => {
    before(() => {
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('M17446 - Emojis preceded by 4 or more spaces are treated as Markdown', () => {
        [
            '    :taco:',
            '     :taco:',
            '    :D',
            '     :D',
        ].forEach((message) => {
            createAndVerifyMessage(message, true);
        });

        [
            '   :taco:',
            '   :D',
        ].forEach((message) => {
            createAndVerifyMessage(message, false);
        });
    });
});
