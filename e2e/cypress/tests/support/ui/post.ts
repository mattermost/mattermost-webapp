// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ChainableT} from '../../types';

function uiGetPostTextBox(option = {exist: true}): ChainableT<JQuery> {
    if (option.exist) {
        return cy.get('#post_textbox').should('be.visible');
    }

    return cy.get('#post_textbox').should('not.exist');
}
Cypress.Commands.add('uiGetPostTextBox', uiGetPostTextBox);

function uiGetReplyTextBox(option = {exist: true}): ChainableT<JQuery> {
    if (option.exist) {
        return cy.get('#reply_textbox').should('be.visible');
    }

    return cy.get('#reply_textbox').should('not.exist');
}
Cypress.Commands.add('uiGetReplyTextBox', uiGetReplyTextBox);

function uiGetPostProfileImage(postId: string): ChainableT<JQuery> {
    return getPost(postId).within(() => {
        return cy.get('.post__img').should('be.visible');
    });
}
Cypress.Commands.add('uiGetPostProfileImage', uiGetPostProfileImage);

function uiGetPostHeader(postId: string): ChainableT<JQuery> {
    return getPost(postId).within(() => {
        return cy.get('.post__header').should('be.visible');
    });
}
Cypress.Commands.add('uiGetPostHeader', uiGetPostHeader);

function uiGetPostBody(postId: string): ChainableT<JQuery> {
    return getPost(postId).within(() => {
        return cy.get('.post__body').should('be.visible');
    });
}
Cypress.Commands.add('uiGetPostBody', uiGetPostBody);

function uiGetPostThreadFooter(postId: string): ChainableT<JQuery> {
    return getPost(postId).find('.ThreadFooter');
}
Cypress.Commands.add('uiGetPostThreadFooter', uiGetPostThreadFooter);

function uiGetPostEmbedContainer(postId: string): ChainableT<JQuery> {
    return cy.uiGetPostBody(postId).
        find('.file-preview__button').
        should('be.visible');
}
Cypress.Commands.add('uiGetPostEmbedContainer', uiGetPostEmbedContainer);

function getPost(postId: string): ChainableT<JQuery> {
    if (postId) {
        return cy.get(`#post_${postId}`).should('be.visible');
    }

    return cy.getLastPost();
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {

            /**
             * Get post profile image of a given post ID or the last post if post ID is not given
             *
             * @param {string} - postId (optional)
             *
             * @example
             *   cy.uiGetPostProfileImage();
             */
            uiGetPostProfileImage: typeof uiGetPostProfileImage;

            /**
             * Get post header of a given post ID or the last post if post ID is not given
             *
             * @param {string} - postId (optional)
             *
             * @example
             *   cy.uiGetPostHeader();
             */
            uiGetPostHeader: typeof uiGetPostHeader;

            /**
             * Get post body of a given post ID or the last post if post ID is not given
             *
             * @param {string} - postId (optional)
             *
             * @example
             *   cy.uiGetPostBody();
             */
            uiGetPostBody: typeof uiGetPostBody;

            /**
             * Get post thread footer of a given post ID or the last post if post ID is not given
             *
             * @param {string} - postId (optional)
             *
             * @example
             *   cy.uiGetPostThreadFooter();
             */
            uiGetPostThreadFooter: typeof uiGetPostThreadFooter;

            /**
             * Get post embed container of a given post ID or the last post if post ID is not given
             *
             * @param {string} - postId (optional)
             *
             * @example
             *   cy.uiGetPostEmbedContainer();
             */
            uiGetPostEmbedContainer: typeof uiGetPostEmbedContainer;

            /**
             * Get post textbox
             *
             * @param {bool} option.exist - Set to false to check whether element should not exist. Otherwise, true (default) to check visibility.
             *
             * @example
             *   cy.uiGetPostTextBox();
             */
            uiGetPostTextBox: typeof uiGetPostTextBox;

            /**
             * Get reply textbox
             *
             * @param {bool} option.exist - Set to false to check whether element should not exist. Otherwise, true (default) to check visibility.
             *
             * @example
             *   cy.uiGetReplyTextBox();
             */
            uiGetReplyTextBox: typeof uiGetReplyTextBox;
        }
    }
}
