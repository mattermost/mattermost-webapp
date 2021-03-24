// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @not_cloud @messaging @markdown

import * as TIMEOUTS from '../../fixtures/timeouts';

const testCases = [
    {name: 'Markdown - typescript', fileKey: 'markdown_typescript'},
    {name: 'Markdown - postgres', fileKey: 'markdown_postgres'},
    {name: 'Markdown - latex', fileKey: 'markdown_latex'},
    {name: 'Markdown - python', fileKey: 'markdown_python'},
    {name: 'Markdown - shell', fileKey: 'markdown_shell'},
];

describe('Markdown', () => {
    let townsquareLink;

    before(() => {
        cy.shouldNotRunOnCloudEdition();

        // # Enable latex
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableLatex: true,
                EnableTesting: true,
            },
        });

        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            townsquareLink = `/${team.name}/channels/town-square`;
            cy.visit(townsquareLink);
        });
    });

    testCases.forEach((testCase, i) => {
        it(`MM-T1734_${i + 1}: Code highlighting - ${testCase.name}`, () => {
            // #  Post markdown message
            cy.postMessageFromFile(`markdown/${testCase.fileKey}.md`).wait(TIMEOUTS.ONE_SEC);

            // * Verify that HTML Content is correct
            cy.compareLastPostHTMLContentFromFile(`markdown/${testCase.fileKey}.html`);
        });
    });

    it('MM-T2241: Markdown basics', () => {
        // # Post markdown message
        cy.postMessage('/test url test-markdown-basics.md').wait(TIMEOUTS.ONE_SEC);

        let postId;
        let expectedHtml;
        cy.getNthPostId(-2).then((id) => {
            postId = id;
            return cy.fixture('markdown/markdown_test_basic.html', 'utf-8');
        }).then((html) => {
            expectedHtml = html;
            const postMessageTextId = `#postMessageText_${postId}`;
            return cy.get(postMessageTextId).invoke('html');
        }).then((res) => {
            // * Verify that HTML Content is correct
            assert(res === expectedHtml.replace(/\n$/, ''));
        });
    });

    it('MM-T2242: Markdown lists', () => {
        // # Post markdown message
        cy.postMessage('/test url test-markdown-lists.md').wait(TIMEOUTS.ONE_SEC);

        let postId;
        let expectedHtml;
        cy.getNthPostId(-2).then((id) => {
            postId = id;
            return cy.fixture('markdown/markdown_list.html', 'utf-8');
        }).then((html) => {
            expectedHtml = html;
            const postMessageTextId = `#postMessageText_${postId}`;
            return cy.get(postMessageTextId).invoke('html');
        }).then((res) => {
            // * Verify that HTML Content is correct
            assert(res === expectedHtml.replace(/\n$/, ''));
        });
    });

    it('MM-T1744: Markdown tables', () => {
        // # Post markdown message
        cy.postMessage('/test url test-tables.md').wait(TIMEOUTS.ONE_SEC);

        let postId;
        let expectedHtml;
        cy.getNthPostId(-2).then((id) => {
            postId = id;
            return cy.fixture('markdown/markdown_tables.html', 'utf-8');
        }).then((html) => {
            expectedHtml = html;
            const postMessageTextId = `#postMessageText_${postId}`;
            return cy.get(postMessageTextId).invoke('html');
        }).then((res) => {
            // * Verify that HTML Content is correct
            assert(res === expectedHtml.replace(/\n$/, ''));
        });
    });

    it('MM-T2246: Markdown code syntax', () => {
        // # Post markdown message
        cy.postMessage('/test url test-syntax-highlighting').wait(TIMEOUTS.ONE_SEC);

        let postId;
        let expectedHtml;
        cy.getNthPostId(-2).then((id) => {
            postId = id;
            return cy.fixture('markdown/markdown_code_syntax.html', 'utf-8');
        }).then((html) => {
            expectedHtml = html;
            const postMessageTextId = `#postMessageText_${postId}`;
            return cy.get(postMessageTextId).invoke('html');
        }).then((res) => {
            // * Verify that HTML Content is correct
            assert(res === expectedHtml.replace(/\n$/, ''));
        });
    });
});
