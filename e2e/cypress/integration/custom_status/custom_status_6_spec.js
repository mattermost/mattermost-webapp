// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @custom_status

describe('Custom Status - Slash Commands', () => {
    before(() => {
        cy.apiUpdateConfig({TeamSettings: {EnableCustomUserStatuses: true}});

        // # Login as test user and visit channel
        cy.apiInitSetup({loginAfter: true}).then(({team, channel}) => {
            cy.visit(`/${team.name}/channels/${channel.name}`);
        });
    });

    const customStatus = {
        emoji: 'laughing',
        text: 'Feeling happy',
    };

    it('MM-T3852_1 should set custom status by slash command', () => {
        // # Set the custom status using slash command
        cy.postMessage(`/status :${customStatus.emoji}: ${customStatus.text}`);

        // * Check if custom status is successfully set by checking the emoji in the sidebar header
        cy.get('#headerInfoContent span.emoticon').invoke('attr', 'data-emoticon').should('contain', customStatus.emoji);

        // * Check if the last system message tells that the custom status is set and contains the custom status emoji and text
        cy.get('.post.post--system').last().
            should('contain.text', 'Your status is set to “').
            and('contain.text', ` ${customStatus.text}”. You can change your status from the status popover in the channel sidebar header.`);
        cy.get('.post.post--system').last().get(`span[data-emoticon="${customStatus.emoji}"]`).should('exist');
    });

    it('MM-T3852_2 should clear custom status by slash command', () => {
        // # Clear the custom status using slash command
        cy.postMessage('/status clear');

        // * Check if custom status is successfully cleared by checking the emoji in the sidebar header
        cy.get('#headerInfoContent span.emoticon').should('not.exist');

        // * Check if the last system message tells that the status is cleared
        cy.get('.post.post--system').last().should('contain.text', 'Your status was cleared.');
    });
});
