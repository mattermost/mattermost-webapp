// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getRandomId} from '../../utils';
import * as TIMEOUTS from '../../fixtures/timeouts';

// Hover effect exists to add a channel description / header (when not already present)
// –––––––––––––––––––––––––

//     Create a new public channel
//     Hover over "Add a channel description" just below the channel name in the center channel  - ("Edit") should appear to the right when you hover
//     Click on "Add a channel description" after "(Edit)" appears
//     Add a description in the edit text input box and hit Enter
//     Hover your mouse over the channel description/header just below the channel name in the center channel

// Note: Follow the steps again for a private channel, DM and GM — expected behavior is the same across all channels
// Expected

//     After you enter a channel description you should no longer see "(Edit)" appear to the right of the channel description/header when you hove and clicking does nothing.
//     The header text you entered is displayed
describe('Channel Settings', () => {
    let testUser;
    let testTeam;

    before(() => {
        cy.apiInitSetup({loginAfter: true}).then(({team, user}) => {
            testTeam = team;
            testUser = user;

            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    beforeEach(() => {
        cy.apiLogin(testUser);
    });

    it('Hover effect exists to add a channel description / header (when not already present)', () => {
        // # Create a new public channel
        cy.apiCreateChannel(testTeam.id, `pub${getRandomId()}`, 'public', 'O').then(({channel: publicChannel}) => {
            // # Go to new public channel
            cy.visit(`/${testTeam.name}/channels/${publicChannel.name}`);

            // # wait a little for channel to load
            cy.wait(TIMEOUTS.FIVE_SEC);

            hoverOnChannelDescriptionAndVerifyBehavior();
        });
    });
});

function hoverOnChannelDescriptionAndVerifyBehavior() {
    const channelDescriptionText = `channel description ${getRandomId()}`;

    // # Scan within channel header description area
    cy.get('#channelHeaderDescription').should('be.visible').as('channelHeaderDescription').within(() => {
        // * Verify that empty header text is visible and click it
        cy.findByText('Add a channel description').should('be.visible').click();
    });

    // # Scan inside the channel header modal
    cy.get('.a11y__modal').should('be.visible').within(() => {
        // # Enter a channel description
        cy.findByTestId('edit_textbox').should('exist').clear().type(channelDescriptionText);

        // # Click on save
        cy.findByText('Save').should('be.visible').click();
    });

    // * Verify that new channel header is set
    cy.get('#channel-header').should('be.visible').within(() => {
        cy.findByText(channelDescriptionText).should('be.visible');
    });
}
