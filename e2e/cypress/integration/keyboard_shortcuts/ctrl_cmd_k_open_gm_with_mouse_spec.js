// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// [#] indicates a test step (e.g. # Go to a page)
// [*] indicates an assertion (e.g. * Check the title)
// Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @messaging

describe('Keyboard Shortcuts', () => {
    before(() => {
        // # Login as test user and visit off-topic
        cy.apiInitSetup({loginAfter: true}).then(({offTopicUrl}) => {
            cy.visit(offTopicUrl);
        });
    });

    it('MM-T1245 CTRL/CMD+K - Open GM using mouse', () => {
        // # create a GM channel
        cy.apiCreateGroupChannel(['cg5tancpjfdgt8kpmbewgeqrmo', 'wf79bueqg3fnfp37rsadyja94e']).then(({channel}) => {
            // press Cmd/Ctrl-K to open "Switch Channels" modal
            cy.get('#post_textbox').cmdOrCtrlShortcut('K');

            // # click on the GM link to go to channel
            cy.get('.status--group').click();

            // * check if channel intro message with usernames is visible
            cy.findByText(/This is the start/).should('be.visible').contains('johnny.hansen, juan.adams');
        });
    });
});
