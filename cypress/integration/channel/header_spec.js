// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Header', () => {
    before(() => {
        // 1. Login and go to /
        cy.login('user-1');
        cy.visit('/');
    });

    it('M13564 Ellipsis indicates the channel header is too long', () => {
        // 2. Update channel header text
        cy.updateChannelHeader('> newheader');

        // * Check if channel header description has no ellipsis
        cy.get('#channelHeaderDescription').ellipsis(false);

        // 3. Update channel header text to a long string
        cy.updateChannelHeader('>' + ' newheader'.repeat(20));

        // * Check if channel header description has ellipsis
        cy.get('#channelHeaderDescription').ellipsis(true);
    });

    it('CS14730 - Channel Header: Markdown quote', () => {
        // 2. Update channel header text
        const header = 'This is a quote in the header';
        cy.updateChannelHeader('>' + header);

        // * Make sure that description contains a blockquote sign
        cy.get('#channelHeaderDescription > span > blockquote').should('be.visible');
        cy.get('#channelHeaderDescription').should('have.html', `<span><blockquote> <p class="markdown__paragraph-inline">${header}</p></blockquote></span>`);
    });
});
