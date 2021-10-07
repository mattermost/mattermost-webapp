// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// [#] indicates a test step (e.g. # Go to a page)
// [*] indicates an assertion (e.g. * Check the title)
// Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @messaging

describe('Messaging', () => {
    before(() => {
        // # Login as test user and visit off-topic
        cy.apiInitSetup({loginAfter: true}).then(({offTopicUrl}) => {
            cy.visit(offTopicUrl);
        });
    });

    it('MM-T3014 Skin tone emoji', () => {
        const emojis = [
            ':wave_light_skin_tone:',
            ':wave_medium_light_skin_tone:',
            ':wave_medium_skin_tone:',
            ':wave_medium_dark_skin_tone:',
            ':wave_dark_skin_tone:',
        ]

        // posting emojis and checking if they are visible on desktop viewport
        emojis.forEach((message) => {
            cy.postMessage(message);
            cy.findByTitle(message).should('be.visible');
        });

        // checking if emojis are visible on mobile viewport
        cy.viewport('iphone-se2')
        emojis.forEach((message) => {
            cy.findByTitle(message).should('be.visible');
        })
    });
});
