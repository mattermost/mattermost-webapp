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

    const inlineImage1 = `<h3 class="markdown__heading">In-line Images</h3><div class="style--none">Mattermost/platform build status:  <a class="theme markdown__link" href="https://travis-ci.org/mattermost/platform" rel="noreferrer" target="_blank"><div class="style--none file-preview__button" style=""><img class="markdown-inline-img" aria-label="file thumbnail" tabindex="0" src="${baseUrl}/api/v4/image?url=https%3A%2F%2Ftravis-ci.org%2Fmattermost%2Fplatform.svg%3Fbranch%3Dmaster"></div></a></div>`;
    const inlineImage2 = `<h3 class="markdown__heading">In-line Images</h3><div class="style--none">GitHub favicon:  <div class="style--none file-preview__button" style=""><img class="markdown-inline-img markdown-inline-img--hover cursor--pointer a11y--active" aria-label="file thumbnail" tabindex="0" src="${baseUrl}/api/v4/image?url=https%3A%2F%2Fgithub.githubassets.com%2Ffavicon.ico"></div></div>`;

    const tests = [
        {name: 'with in-line images 1', fileKey: 'markdown_inline_images_1', expected: inlineImage1},
        {name: 'with in-line images 2', fileKey: 'markdown_inline_images_2', expected: inlineImage2},
    ];

    tests.forEach((test) => {
        it(test.name, () => {
            // #  Post markdown message
            cy.postMessageFromFile(`markdown/${test.fileKey}.md`);

            // * Verify that HTML Content is correct.
            // Note we use the Gigantic timeout to ensure that the large images will load
            cy.getLastPostId().then((postId) => {
                cy.get(`#postMessageText_${postId}`, {timeout: TIMEOUTS.GIGANTIC}).should('have.html', test.expected);
            });
        });
    });

    it('opens preview window when image is clicked', () => {
        // #  Post markdown message
        cy.postMessageFromFile('markdown/markdown_inline_images_2.md');

        // Note we use the Gigantic timeout to ensure that the large images will load
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`, {timeout: TIMEOUTS.GIGANTIC}).then((post) => {
                // # Get the image and simulate a click.
                cy.wrap(post).find('img.markdown-inline-img').first().click();

                // * Verify that the file preview opens
                cy.get('div.file-details__container').first().should('exist');
            });
        });
    });
});
