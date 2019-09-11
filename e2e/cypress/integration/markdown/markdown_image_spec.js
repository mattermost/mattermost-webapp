// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Markdown', () => {
    before(() => {
        // # Login as new user
        cy.loginAsNewUser().then(() => {
            // # Create new team and visit its URL
            cy.apiCreateTeam('test-team', 'Test Team').then((response) => {
                cy.visit(`/${response.body.name}`);
            });
        });
    });

    const baseUrl = Cypress.config('baseUrl');

    it('with in-line images 1', () => {
        // #  Post markdown message
        cy.postMessageFromFile('markdown/markdown_inline_images_1.md').wait(TIMEOUTS.SMALL);

        // * Verify that HTML Content is correct.
        // Note we use the Gigantic timeout to ensure that the large images will load
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).find('p').
                should('have.text', 'Mattermost/platform build status:  ');

            cy.get(`#postMessageText_${postId}`).find('img').
                should('have.class', 'markdown-inline-img').
                and('have.attr', 'alt', 'Build Status').
                and('have.attr', 'src', `${baseUrl}/api/v4/image?url=https%3A%2F%2Ftravis-ci.org%2Fmattermost%2Fplatform.svg%3Fbranch%3Dmaster`);
        });
    });

    it('with in-line images 2', () => {
        // #  Post markdown message
        cy.postMessageFromFile('markdown/markdown_inline_images_2.md').wait(TIMEOUTS.SMALL);

        // * Verify that HTML Content is correct.
        // Note we use the Gigantic timeout to ensure that the large images will load
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).find('p').
                should('have.text', 'GitHub favicon:  ');

            cy.get(`#postMessageText_${postId}`).find('img').
                should('have.class', 'markdown-inline-img').
                and('have.attr', 'alt', 'Github').
                and('have.attr', 'src', `${baseUrl}/api/v4/image?url=https%3A%2F%2Fgithub.githubassets.com%2Ffavicon.ico`);
        });
    });
});
