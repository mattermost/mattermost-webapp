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
        const gestures = [
            ':wave',
            ':point_up',
            ':clap',
            ':+1',
        ];

        const skinTones = [
            '_light_skin_tone:',
            '_medium_light_skin_tone:',
            '_medium_skin_tone:',
            '_medium_dark_skin_tone:',
            '_dark_skin_tone:',
        ];

        // posting emojis and checking if they are visible on desktop viewport
        gestures.forEach((gesture) => {
            skinTones.forEach((skinTone) => {
                cy.viewport('macbook-13'); // setting viewport to desktop
                cy.postMessage(gesture + skinTone);
                cy.findByTitle(gesture + skinTone).should('be.visible');
                cy.viewport('iphone-se2'); // setting viewport to mobile
                cy.findByTitle(gesture + skinTone).should('be.visible');
            });
        });
    });
});
