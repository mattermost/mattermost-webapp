// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod @smoke
// Group: @markdown @visual-diff

import * as TIMEOUTS from '../../fixtures/timeouts';

const testCases = [
    {name: 'Markdown - basic', fileKey: 'markdown_basic', keyText: 'Basic Markdown Testing'},
    {name: 'Markdown - text style', fileKey: 'markdown_text_style', keyText: 'Text Style'},
    {name: 'Markdown - carriage return', fileKey: 'markdown_carriage_return', keyText: 'Carriage Return'},
    {name: 'Markdown - code block', fileKey: 'markdown_code_block', keyText: 'Code Blocks'},
    {name: 'Markdown - should not render inside the code block', fileKey: 'markdown_not_in_code_block', keyText: 'The following markdown should not render:'},
    {name: 'Markdown - should not auto-link or generate previews', fileKey: 'markdown_not_autolink', keyText: 'The following links should not auto-link or generate previews:'},
    {name: 'Markdown - should appear as a carriage return separating two lines of text', fileKey: 'markdown_carriage_return_two_lines', keyText: 'The following should appear as a carriage return separating two lines of text:'},
    {name: 'Markdown - in-line code', fileKey: 'markdown_inline_code', keyText: 'In-line Code'},
    {name: 'Markdown - lines', fileKey: 'markdown_lines', keyText: 'Lines'},
    {name: 'Markdown - headings', fileKey: 'markdown_headings', keyText: 'Headings'},
    {name: 'Markdown - escape characters', fileKey: 'markdown_escape_characters', keyText: 'Escaped Characters'},
    {name: 'Markdown - block quotes 1', fileKey: 'markdown_block_quotes_1', keyText: 'Block Quotes'},
];

describe('Markdown message', () => {
    let team;

    before(() => {
        // # Login as sysadmin and enable local image proxy so our expected URLs match
        cy.apiLogin('sysadmin');
        const newSettings = {
            ImageProxySettings: {
                Enable: true,
                ImageProxyType: 'local',
                RemoteImageProxyURL: '',
                RemoteImageProxyOptions: '',
            },
        };
        cy.apiUpdateConfig(newSettings);

        // # Login as new user
        cy.apiCreateAndLoginAsNewUser().then(() => {
            // # Create new team and visit its URL
            cy.apiCreateTeam('test-team', 'Test Team').then((response) => {
                team = response.body;
                cy.visit(`/${response.body.name}`);
            });
        });
    });

    afterEach(() => {
        cy.closeVisualWindow();
    });

    function openVisualWindow(testName) {
        cy.openVisualWindow({
            browser: [{width: 1024, height: 1000, name: 'chrome'}],
            batchName: 'Markdown Text',
            appName: 'Mattermost Webapp',
            testName
        });
    }

    testCases.forEach((testCase, index) => {
        it(testCase.name, () => {
            openVisualWindow(testCase.name);

            cy.apiCreateChannel(team.id, `md-text-${index}`, `Markdown Test ${index}`).then((res) => {
                cy.visit(`/${team.name}/channels/${res.body.name}`);

                // #  Post markdown message
                cy.postMessageFromFile(`markdown/${testCase.fileKey}.md`).wait(TIMEOUTS.TINY);

                // * Verify that HTML Content is correct
                cy.getLastPostId().then((postId) => {
                    const postMessageTextId = `#postMessageText_${postId}`;
                    cy.get(postMessageTextId).should('be.visible').within(() => {
                        cy.findByText(testCase.keyText);

                        cy.saveScreenshot();
                    });
                });
            });
        });
    });

    it('Markdown - block quotes 2', () => {
        openVisualWindow('Markdown - block quotes 2');

        cy.apiCreateChannel(team.id, 'md-text-12', 'Markdown Test 12').then((res) => {
            cy.visit(`/${team.name}/channels/${res.body.name}`);

            // #  Post markdown message
            cy.postMessageFromFile('markdown/markdown_block_quotes_2.md').wait(TIMEOUTS.TINY);

            // * Verify that HTML Content is correct
            cy.getLastPostId().then((postId) => {
                const postMessageTextId = `#postMessageText_${postId}`;
                cy.get(postMessageTextId).should('be.visible').within(() => {
                    cy.findByText('The following markdown should render within the block quote:');

                    cy.saveScreenshot();
                });
            });
        });
    });
});
