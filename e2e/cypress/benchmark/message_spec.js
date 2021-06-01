// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging @benchmark

import {reportBenchmarkResults} from '../utils/benchmark';

describe('Message', () => {
    let testTeam;
    let testChannel;

    before(() => {
        // # Create new team and new user and visit Town Square channel
        cy.apiInitSetup({loginAfter: true}).then(({team, channel}) => {
            testTeam = team;
            testChannel = channel;
            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('Current user posting message in empty channel', () => {
        cy.wait(1000);

        // # Wait for posts to load
        cy.get('#postListContent').should('be.visible');

        // # Reset selector measurements
        cy.window().then((win) => {
            win.resetTrackedSelectors()

            // # Post message "One"
            cy.postMessage('One');

            cy.getLastPostId().then((postId) => {
                const divPostId = `#postMessageText_${postId}`;

                // * Check that the message was created
                cy.get(divPostId).find('p').should('have.text', 'One');

                reportBenchmarkResults(cy, win);
            });
        });
    });
});
