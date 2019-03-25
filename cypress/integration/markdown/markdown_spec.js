// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

/* eslint max-nested-callbacks: ["error", 3] */

const testCases = [
    {name: 'Markdown - basic', fileKey: 'markdown_basic'},
    {name: 'Markdown - text style', fileKey: 'markdown_text_style'},
    {name: 'Markdown - carriage return', fileKey: 'markdown_carriage_return'},
    {name: 'Markdown - code block', fileKey: 'markdown_code_block'},
    {name: 'Markdown - should not render inside the code block', fileKey: 'markdown_not_in_code_block'},
    {name: 'Markdown - should not auto-link or generate previews', fileKey: 'markdown_not_autolink'},
    {name: 'Markdown - should appear as a carriage return separating two lines of text', fileKey: 'markdown_carriage_return_two_lines'},
    {name: 'Markdown - in-line code', fileKey: 'markdown_inline_code'},
    {name: 'Markdown - in-line images 1', fileKey: 'markdown_inline_images_1'},
    {name: 'Markdown - in-line images 2', fileKey: 'markdown_inline_images_2'},
    {name: 'Markdown - in-line images 3', fileKey: 'markdown_inline_images_3'},
    {name: 'Markdown - in-line images 4', fileKey: 'markdown_inline_images_4'},
    {name: 'Markdown - in-line images 5', fileKey: 'markdown_inline_images_5'},
    {name: 'Markdown - lines', fileKey: 'markdown_lines'},
    {name: 'Markdown - block quotes 1', fileKey: 'markdown_block_quotes_1'},
    {name: 'Markdown - block quotes 2', fileKey: 'markdown_block_quotes_2'},
    {name: 'Markdown - headings', fileKey: 'markdown_headings'},
    {name: 'Markdown - escape characters', fileKey: 'markdown_escape_characters'},
];

describe('Markdown message', () => {
    before(() => {
        // 1. Login as "user-1" and go to /
        cy.login('user-1');
        cy.visit('/');
    });

    testCases.forEach((testCase) => {
        it(testCase.name, () => {
            // 2.  Post markdown message
            cy.postMessageFromFile(`markdown/${testCase.fileKey}.md`);

            // * Verify that HTML Content is correct
            cy.compareLastPostHTMLContentFromFile(`markdown/${testCase.fileKey}.html`);
        });
    });
});
