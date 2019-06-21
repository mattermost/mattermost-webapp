// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/* eslint max-nested-callbacks: ["error", 4] */

import * as TIMEOUTS from '../../fixtures/timeouts';

const testCases = [
    {name: 'Markdown - basic', fileKey: 'markdown_basic'},
    {name: 'Markdown - text style', fileKey: 'markdown_text_style'},
    {name: 'Markdown - carriage return', fileKey: 'markdown_carriage_return'},
    {name: 'Markdown - code block', fileKey: 'markdown_code_block'},
    {name: 'Markdown - should not render inside the code block', fileKey: 'markdown_not_in_code_block'},
    {name: 'Markdown - should not auto-link or generate previews', fileKey: 'markdown_not_autolink'},
    {name: 'Markdown - should appear as a carriage return separating two lines of text', fileKey: 'markdown_carriage_return_two_lines'},
    {name: 'Markdown - in-line code', fileKey: 'markdown_inline_code'},
    {name: 'Markdown - lines', fileKey: 'markdown_lines'},
    {name: 'Markdown - block quotes 1', fileKey: 'markdown_block_quotes_1'},
    {name: 'Markdown - block quotes 2', fileKey: 'markdown_block_quotes_2'},
    {name: 'Markdown - headings', fileKey: 'markdown_headings'},
    {name: 'Markdown - escape characters', fileKey: 'markdown_escape_characters'},
];

describe('Markdown message', () => {
    before(() => {
        // # Disable fetch so requests fall back to XHR so we can listen to routes
        cy.on('window:before:load', (win) => {
            win.fetch = null;
        });

        // # Enable local image proxy so our expected URLs match
        const newSettings = {
            ImageProxySettings: {
                Enable: true,
                ImageProxyType: 'local',
                RemoteImageProxyURL: '',
                RemoteImageProxyOptions: '',
            },
        };
        cy.apiUpdateConfig(newSettings);

        // # Login as "user-1"
        cy.apiLogin('user-1');

        // # Start cypress server, and listen for request to get posts
        cy.server();
        cy.route('GET', 'api/v4/channels/**/posts*').as('getPosts');

        // # Navigate to app and wait for posts request to finish
        cy.visit('/');
        cy.wait('@getPosts', {timeout: TIMEOUTS.HUGE}).should('have.property', 'status', 200);
    });

    testCases.forEach((testCase) => {
        it(testCase.name, () => {
            // #  Post markdown message
            cy.postMessageFromFile(`markdown/${testCase.fileKey}.md`);

            // * Verify that HTML Content is correct
            cy.compareLastPostHTMLContentFromFile(`markdown/${testCase.fileKey}.html`);
        });
    });

    describe('with images', () => {
        const tests = [
            {name: 'Markdown - in-line images 1', fileKey: 'markdown_inline_images_1'},
            {name: 'Markdown - in-line images 2', fileKey: 'markdown_inline_images_2'},
            {name: 'Markdown - in-line images 3 (Gif)', fileKey: 'markdown_inline_images_3'},
            {name: 'Markdown - in-line images 4 (4k)', fileKey: 'markdown_inline_images_4'},
            {name: 'Markdown - in-line images 5 (Panorama)', fileKey: 'markdown_inline_images_5'},
        ];

        tests.forEach((test) => {
            it(test.name, () => {
                // #  Post markdown message
                cy.postMessageFromFile(`markdown/${test.fileKey}.md`);

                // * Verify that HTML Content is correct.
                // Note we use the Gigantic timeout to ensure that the large images will load
                cy.compareLastPostHTMLContentFromFile(`markdown/${test.fileKey}.html`, TIMEOUTS.GIGANTIC);
            });
        });
    });
});
