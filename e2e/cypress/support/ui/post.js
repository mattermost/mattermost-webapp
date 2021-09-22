// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

Cypress.Commands.add('uiGetPostHeader', (postId) => {
    return getPost(postId).within(() => {
        return cy.get('.post__header').should('be.visible');
    });
});

Cypress.Commands.add('uiGetPostBody', (postId) => {
    return getPost(postId).within(() => {
        return cy.get('.post__body').should('be.visible');
    });
});

Cypress.Commands.add('uiGetPostEmbedContainer', (postId) => {
    return cy.uiGetPostBody(postId).
        find('.file-preview__button').
        should('be.visible');
});

function getPost(postId) {
    if (postId) {
        return cy.get(`post_${postId}`).should('be.visible');
    }

    return cy.getLastPost();
}
