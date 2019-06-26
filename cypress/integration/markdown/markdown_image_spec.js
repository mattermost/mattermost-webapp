// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/* eslint max-nested-callbacks: ["error", 4] */

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Markdown', () => {
    before(() => {
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    const baseUrl = Cypress.config('baseUrl');

    const inlineImage1 = `<h3 class="markdown__heading">In-line Images</h3><p>Mattermost/platform build status:  <a class="theme markdown__link" href="https://travis-ci.org/mattermost/platform" rel="noreferrer" target="_blank"><img alt="Build Status" class="markdown-inline-img" src="${baseUrl}/api/v4/image?url=https%3A%2F%2Ftravis-ci.org%2Fmattermost%2Fplatform.svg%3Fbranch%3Dmaster"></a></p>`;
    const inlineImage2 = `<h3 class="markdown__heading">In-line Images</h3><p>GitHub favicon:  <img alt="Github" class="markdown-inline-img" src="${baseUrl}/api/v4/image?url=https%3A%2F%2Fgithub.githubassets.com%2Ffavicon.ico"></p>`;
    const inlineImage3 = `<h3 class="markdown__heading">In-line Images</h3><p>GIF Image:
<img alt="gif" class="markdown-inline-img" src="${baseUrl}/api/v4/image?url=http%3A%2F%2Fi.giphy.com%2FxNrM4cGJ8u3ao.gif" style=""></p>`;
    const inlineImage4 = `<h3 class="markdown__heading">In-line Images</h3><p>4K Wallpaper Image (11Mb):
<img alt="4K Image" class="markdown-inline-img" src="${baseUrl}/api/v4/image?url=https%3A%2F%2Fimages.wallpaperscraft.com%2Fimage%2Fstarry_sky_shine_glitter_118976_3840x2160.jpg" style=""></p>`;
    const inlineImage5 = `<h3 class="markdown__heading">In-line Images</h3><p>Panorama Image:
<img alt="Pano" class="markdown-inline-img" src="${baseUrl}/api/v4/image?url=http%3A%2F%2Famardeepphotography.com%2Fwp-content%2Fuploads%2F2012%2F11%2FUntitled_Panorama6small.jpg" style=""></p>`;

    const tests = [
        {name: 'with in-line images 1', fileKey: 'markdown_inline_images_1', expected: inlineImage1},
        {name: 'with in-line images 2', fileKey: 'markdown_inline_images_2', expected: inlineImage2},
        {name: 'with in-line images 3 (Gif)', fileKey: 'markdown_inline_images_3', expected: inlineImage3},
        {name: 'with in-line images 4 (4k)', fileKey: 'markdown_inline_images_4', expected: inlineImage4},
        {name: 'with in-line images 5 (Panorama)', fileKey: 'markdown_inline_images_5', expected: inlineImage5},
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
});
